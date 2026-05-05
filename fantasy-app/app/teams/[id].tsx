import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Button,
  RefreshControl,
} from "react-native";
import { getTeamById, Team, syncTeamPoints } from "../../services/teams";
import { getCurrentUser } from "@/services/user";
import API from "../../services/api";
import { getLeagueTeams } from "@/services/leagues";

interface TeamPlayer {
  id: number;
  player_id: number;
  name: string;
  position: string;
  team: string;
  slot: string; // The database column that saves "First Base", "Infielder", etc.
  points: number;
}

const getDraftStatus = (totalPicks: number, numTeams: number) => {
  if (numTeams === 0) return { round: 1, pickingTeamIndex: 0 };
  const round = Math.floor(totalPicks / numTeams) + 1;
  const pickInRound = (totalPicks % numTeams) + 1;

  // Reverse order on even rounds
  const pickingTeamIndex =
    round % 2 !== 0 ? pickInRound - 1 : numTeams - pickInRound;

  return { round, pickingTeamIndex };
};

export default function TeamPage() {
  const { id, leagueId } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [allLeagueTeams, setAllLeagueTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [leagueDraftedIds, setLeagueDraftedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchTeamData = async () => {
        try {
          const [
            teamData,
            rosterRes,
            userIdData,
            leagueRosterRes,
            leagueTeams,
          ] = await Promise.all([
            getTeamById(Number(id)),
            API.get(`/teams/${id}/players`),
            getCurrentUser(),
            API.get(`/leagues/${leagueId}/drafted-players`),
            getLeagueTeams(Number(leagueId)),
          ]);

          setTeam(teamData);
          setPlayers(rosterRes.data);
          setLeagueDraftedIds(leagueRosterRes.data);
          setCurrentUser(userIdData.id);
          setAllLeagueTeams(
            leagueTeams.sort((a: any, b: any) => a.draft_order - b.draft_order),
          );

          setLoading(false);

          onRefresh();
        } catch (err) {
          console.error("Error fetching team data:", err);
          setLoading(false);
        }
      };
      fetchTeamData();
    }, [id, leagueId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("Refreshing started");

    try {
      const result = await syncTeamPoints(Number(id));
      console.log("Backend Sync Result:", result);

      const rosterRes = await API.get(`/teams/${id}/players`);
      console.log("New Roster Data:", rosterRes.data);

      setPlayers(rosterRes.data);
    } catch (err) {
      console.error("Sync failed error:", err);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (refreshing) return;
    const pollData = async () => {
      try {
        // await syncTeamPoints(Number(id));
        const leagueRosterRes = await API.get(
          `/leagues/${leagueId}/drafted-players`,
        );

        const rosterRes = await API.get(`/teams/${id}/players`);

        setLeagueDraftedIds(leagueRosterRes.data);
        setPlayers(rosterRes.data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll every 3 seconds (3000ms)
    const interval = setInterval(pollData, 3000);

    return () => clearInterval(interval);
  }, [id, leagueId, refreshing]);

  const handleAddPlayerNav = (positionName: string) => {
    // const currentIds = players.map((p) => p.player_id);

    router.push({
      pathname: "/positionPlayer",
      params: {
        position: positionName,
        teamId: id,
        lID: leagueId,
        existingIds: JSON.stringify(leagueDraftedIds),
      },
    });
  };
  const { round, pickingTeamIndex } = getDraftStatus(
    leagueDraftedIds.length,
    allLeagueTeams.length,
  );
  const teamOnClock = allLeagueTeams[pickingTeamIndex];
  const isUserTurn = currentUser === teamOnClock?.user_id;
  const isViewingOwnTeam = currentUser === team?.user_id;
  console.log("Current User:", currentUser, typeof currentUser);
  console.log(
    "Team on Clock UserID:",
    teamOnClock?.user_id,
    typeof teamOnClock?.user_id,
  );
  console.log("Is it turn?", currentUser === teamOnClock?.user_id);

  // const renderSlot = (label: string, searchPos: string, index: number = 0) => {
  //   const matchingPlayers = players.filter((p) => p.slot === label);
  //   const player = matchingPlayers[index];
  //   const isOwner = currentUser === team?.user_id;

  //   if (player) {
  //     return (
  //       <View key={`${player.id}-${index}`}>
  //         <Text>
  //           {label}: {player.name} ({player.position})
  //         </Text>
  //       </View>
  //     );
  //   }

  //   if (isOwner) {
  //     return (
  //       <View key={`${label}-${index}`}>
  //         <Button
  //           title={`Add ${label}`}
  //           onPress={() => handleAddPlayerNav(searchPos)}
  //         />
  //       </View>
  //     );
  //   }

  //   return null;
  // };

  const updateSlot = async (player_id: number, slot: string) => {
    try {
      await API.patch(`/teams/${id}/players`, {
        team_id: Number(id),
        player_id,
        slot,
      });

      // refresh roster
      const rosterRes = await API.get(`/teams/${id}/players`);
      setPlayers(rosterRes.data);
    } catch (err) {
      console.error("Slot update failed:", err);
    }
  };

  const isValidForSlot = (playerPos: string, slot: string) => {
    if (slot === "Bench") return true;

    if (slot === "Outfielder") return playerPos === "Outfielder";
    if (slot === "Pitcher") return playerPos === "Pitcher";

    return playerPos === slot;
  };

  const renderSlot = (label: string, searchPos: string, index: number = 0) => {
    const player = players.filter((p) => p.slot === label)[index];

    if (player) {
      return (
        <View key={`${player.id}-${index}`} style={{ paddingVertical: 5 }}>
          <Text>
            {label}: {player.name} ({player.position})
          </Text>
          <Text style={{ fontWeight: "bold" }}>{player.points || 0} pts</Text>

          {isViewingOwnTeam && (
            <Button
              title="Bench"
              onPress={() => updateSlot(player.player_id, "Bench")}
            />
          )}
        </View>
      );
    }

    // Only show "Draft" button if it's the User's Turn AND they are on their own page
    if (isUserTurn && isViewingOwnTeam) {
      return (
        <View key={`${label}-${index}`} style={{ marginVertical: 5 }}>
          <Button
            title={`Draft ${label}`}
            onPress={() => handleAddPlayerNav(searchPos)}
          />
        </View>
      );
    }

    return (
      <View key={`${label}-${index}`} style={{ paddingVertical: 5 }}>
        <Text style={{ color: "gray" }}>{label}: (Waiting...)</Text>
      </View>
    );
  };
  const totalPoints = players.reduce(
    (sum, player) => sum + (Number(player.points) || 0),
    0,
  );
  if (loading) return <ActivityIndicator />;
  if (!team) return <Text>Team not found</Text>;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Button
        title={refreshing ? "Syncing..." : "Manual Sync (Browser Test)"}
        onPress={onRefresh}
        disabled={refreshing}
      />
      <Text>{team.name}</Text>
      <Text>Owner: {team.username}</Text>
      <Text>Total Team Points</Text>
      <Text>{totalPoints.toFixed(1)} pts</Text>
      <View>
        <Text>CATCHERS</Text>
        {renderSlot("Catcher", "Catcher", 0)}
        {renderSlot("Catcher", "Catcher", 1)}

        <Text>INFIELD</Text>
        {renderSlot("First Baseman", "First Baseman")}
        {renderSlot("Second Baseman", "Second Baseman")}
        {renderSlot("Shortstop", "Shortstop")}
        {renderSlot("Third Baseman", "Third Baseman")}
        {renderSlot("Infielder", "Infielder", 0)}
        {renderSlot("Infielder", "Infielder", 1)}

        <Text>OUTFIELD</Text>
        {[0, 1, 2, 3, 4].map((i) => renderSlot("Outfielder", "Outfielder", i))}

        <Text>UTILITY</Text>
        {renderSlot("Designated Hitter", "Designated Hitter")}

        <Text>PITCHERS</Text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) =>
          renderSlot("Pitcher", "Pitcher", i),
        )}

        <Text>BENCH</Text>

        {players
          .filter((p) => p.slot === "Bench")
          .map((player) => (
            <View key={player.id} style={{ paddingVertical: 5 }}>
              <Text>
                {player.name} ({player.position})
              </Text>

              {/* Move from bench → valid slot */}
              {isViewingOwnTeam && (
                <>
                  {[
                    "Catcher",
                    "First Baseman",
                    "Second Baseman",
                    "Third Baseman",
                    "Shortstop",
                    "Outfielder",
                    "Pitcher",
                    "Designated Hitter",
                  ]
                    .filter((slot) => isValidForSlot(player.position, slot))
                    .map((slot) => (
                      <Button
                        key={slot}
                        title={`Add to ${slot}`}
                        onPress={() =>
                          updateSlot(player.player_id, slot)
                        }
                      />
                    ))}
                </>
              )}
            </View>
          ))}

        <Button
          title="Trades"
          onPress={() =>
            router.push({
              pathname: "/trades/[teamId]",
              params: {
                teamId: String(id),
                leagueId: leagueId,
              },
            })
          }
        />
      </View>
    </ScrollView>
  );
}
