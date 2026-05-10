import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Button,
  RefreshControl,
  Platform,
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
  const [league, setLeague] = useState<any>(null);
  const [allLeagueTeams, setAllLeagueTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [selectedBenchPlayer, setSelectedBenchPlayer] =
    useState<TeamPlayer | null>(null);
  const [swappingPlayer, setSwappingPlayer] = useState<TeamPlayer | null>(null);
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
            leagueDetails,
          ] = await Promise.all([
            getTeamById(Number(id)),
            API.get(`/teams/${id}/players`),
            getCurrentUser(),
            API.get(`/leagues/${leagueId}/drafted-players`),
            getLeagueTeams(Number(leagueId)),
            API.get(`/leagues/${leagueId}`),
          ]);

          setTeam(teamData);
          setPlayers(rosterRes.data);
          setLeagueDraftedIds(leagueRosterRes.data);
          setCurrentUser(userIdData.id);
          setLeague(leagueDetails.data);
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
    console.log("Refreshing started...");

    try {
      // 1. Tell backend to pull new stats from ESPN and update the DB
      await syncTeamPoints(Number(id));

      // 2. Fetch the UPDATED data from the database
      // We fetch both so the Season Total (team) and Roster (players) match
      const [rosterRes, updatedTeamData] = await Promise.all([
        API.get(`/teams/${id}/players`),
        getTeamById(Number(id)),
      ]);

      // 3. Update local state to trigger a re-render
      setPlayers(rosterRes.data);
      setTeam(updatedTeamData);

      console.log("Sync UI Update Complete");
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (refreshing || !league?.draft) return;
    const pollData = async () => {
      try {
        // await syncTeamPoints(Number(id));
        const leagueRosterRes = await API.get(
          `/leagues/${leagueId}/drafted-players`,
        );

        const rosterRes = await API.get(`/teams/${id}/players`);
        const completionRes = await API.get(
          `/leagues/${leagueId}/check-completion`,
        );
        setLeagueDraftedIds(leagueRosterRes.data);
        setPlayers(rosterRes.data);
        if (completionRes.data.finished && league?.draft) {
          console.log("Draft completion detected!");

          // Fetch fresh league details to update league.draft to 'false'
          // and league.draft_complete to 'true'
          const updatedLeague = await API.get(`/leagues/${leagueId}`);
          setLeague(updatedLeague.data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll every 3 seconds (3000ms)
    const interval = setInterval(pollData, 3000);

    return () => clearInterval(interval);
  }, [id, leagueId, refreshing, league?.draft]);

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
  const handleDropPlayer = async (player_id: number) => {
    const message = "Are you sure you want to drop this player?";

    // Cross-platform confirmation
    const confirmed = Platform.OS === "web" ? window.confirm(message) : true; // For mobile, you'd ideally use Alert.alert here

    if (confirmed) {
      try {
        // This hits your backend route: router.delete("/:id/players/:playerId")
        await API.delete(`/teams/${id}/players/${player_id}`);

        // Refresh the local roster state
        const rosterRes = await API.get(`/teams/${id}/players`);
        setPlayers(rosterRes.data);

        console.log("Player dropped successfully");
      } catch (err) {
        console.error("Drop failed:", err);
        alert("Failed to drop player.");
      }
    }
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

  // const updateSlot = async (player_id: number, slot: string) => {
  //   try {
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id,
  //       slot,
  //     });

  //     // refresh roster
  //     const rosterRes = await API.get(`/teams/${id}/players`);
  //     setPlayers(rosterRes.data);
  //   } catch (err) {
  //     console.error("Slot update failed:", err);
  //   }
  // };
  const updateSlot = async (player_id: number, newSlot: string) => {
    try {
      // 1. Define the capacity for each slot type
      const slotCapacities: { [key: string]: number } = {
        Catcher: 2,
        Infielder: 6,
        Outfielder: 5,
        Pitcher: 9,
        "Designated Hitter": 1,
        Bench: 5,
      };

      // 2. Count how many players are currently in the target slot
      const playersInTargetSlot = players.filter((p) => p.slot === newSlot);
      const capacity = slotCapacities[newSlot] || 1;

      // 3. If the slot is full, bump the first player we find in that slot to the Bench
      if (newSlot !== "Bench" && playersInTargetSlot.length >= capacity) {
        const playerToBump = playersInTargetSlot[0]; // Bumps the first one in the list

        await API.patch(`/teams/${id}/players`, {
          team_id: Number(id),
          player_id: playerToBump.player_id,
          slot: "Bench",
        });
      }

      // 4. Move the new player into the slot
      await API.patch(`/teams/${id}/players`, {
        team_id: Number(id),
        player_id: player_id,
        slot: newSlot,
      });

      // 5. Refresh Roster
      const rosterRes = await API.get(`/teams/${id}/players`);
      setPlayers(rosterRes.data);
    } catch (err) {
      console.error("Swap failed:", err);
    }
  };
  // const performSwap = async (starterToReplace: TeamPlayer) => {
  //   if (!selectedBenchPlayer) return;

  //   // 1. Safety Check: Verify position eligibility before hitting the API
  //   const isEligible = isValidForSlot(
  //     selectedBenchPlayer.position,
  //     starterToReplace.slot,
  //   );

  //   if (!isEligible) {
  //     alert(
  //       `${selectedBenchPlayer.name} (${selectedBenchPlayer.position}) cannot play ${starterToReplace.slot}!`,
  //     );
  //     return;
  //   }

  //   try {
  //     // 2. Move the Starter to the Bench
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: starterToReplace.player_id,
  //       slot: "Bench",
  //     });

  //     // 3. Move the Selected Bench Player to the Starter's Slot
  //     await API.patch(`/teams/${id}/players`, {
  //       team_id: Number(id),
  //       player_id: selectedBenchPlayer.player_id,
  //       slot: starterToReplace.slot,
  //     });

  //     // 4. Reset state and refresh
  //     setSelectedBenchPlayer(null);
  //     const rosterRes = await API.get(`/teams/${id}/players`);
  //     setPlayers(rosterRes.data);

  //     alert(
  //       `Swapped ${selectedBenchPlayer.name} with ${starterToReplace.name}`,
  //     );
  //   } catch (err) {
  //     console.error("Swap error:", err);
  //     alert("An error occurred while swapping players.");
  //   }
  // };
  const performSwap = async (playerA: TeamPlayer, playerB: TeamPlayer) => {
    const aCanGoToB = isValidForSlot(playerA.position, playerB.slot);
    const bCanGoToA = isValidForSlot(playerB.position, playerA.slot);
    if (!aCanGoToB || !bCanGoToA) {
      alert(
        `Invalid Swap: ${playerA.position} and ${playerB.position} are not compatible for these slots.`,
      );
      return;
    }
    try {
      // Move Player A to Player B's slot
      await API.patch(`/teams/${id}/players`, {
        team_id: Number(id),
        player_id: playerA.player_id,
        slot: playerB.slot,
      });

      // Move Player B to Player A's slot
      await API.patch(`/teams/${id}/players`, {
        team_id: Number(id),
        player_id: playerB.player_id,
        slot: playerA.slot,
      });

      setSwappingPlayer(null); // Reset
      const rosterRes = await API.get(`/teams/${id}/players`);
      setPlayers(rosterRes.data);
      alert(`Swapped ${playerA.name} and ${playerB.name}`);
    } catch (err) {
      console.error("Swap failed", err);
    }
  };
  // // Inside TeamPage pollData function
  // const pollData = async () => {
  //   try {
  //     const [leagueRosterRes, rosterRes, completionRes] = await Promise.all([
  //       API.get(`/leagues/${leagueId}/drafted-players`),
  //       API.get(`/teams/${id}/players`),
  //       API.get(`/leagues/${leagueId}/check-completion`), // 🔥 New completion check
  //     ]);

  //     setLeagueDraftedIds(leagueRosterRes.data);
  //     setPlayers(rosterRes.data);

  //     // 🔥 If backend says draft is finished, but our local state thinks it's still going
  //     if (completionRes.data.finished && league?.draft) {
  //       // Re-fetch league to update state and unlock swapping
  //       const leagueDetails = await API.get(`/leagues/${leagueId}`);
  //       setLeague(leagueDetails.data);
  //       console.log("Draft complete! Rosters unlocked.");
  //     }
  //   } catch (err) {
  //     console.error("Polling error:", err);
  //   }
  // };

  // const isValidForSlot = (playerPos: string, slot: string) => {
  //   if (slot === "Bench" || slot === "Any") return true;
  //   const isPitcher = [
  //     "Pitcher",
  //     "Relief Pitcher",
  //     "Starting Pitcher",
  //     "RP",
  //   ].includes(playerPos);
  //   if (slot === "Pitcher") return isPitcher;
  //   if (isPitcher) return false;
  //   const isOutfielder = [
  //     "Left Fielder",
  //     "Right Fielder",
  //     "Center Fielder",
  //     "Outfielder",
  //   ].includes(playerPos);
  //   // Infielder accepts multiple positions
  //   if (slot === "Infielder") {
  //     return [
  //       "First Baseman",
  //       "Second Baseman",
  //       "Third Baseman",
  //       "Shortstop",
  //     ].includes(playerPos);
  //   }

  //   if (slot === "Outfielder") return isOutfielder;
  //   if (isPitcher) return false;
  //   if (slot === "Catcher") return ["Catcher", "C"].includes(playerPos);
  //   // if (slot === "Pitcher") return playerPos === "Pitcher";

  //   return playerPos === slot;
  // };
  const isValidForSlot = (playerPos: string, slot: string) => {
    if (slot === "Bench" || slot === "Any") return true;

    const isPitcher = [
      "Pitcher",
      "Relief Pitcher",
      "Starting Pitcher",
      "RP",
      "SP",
      "P",
    ].includes(playerPos);

    // 1. Pitcher Slot Rule
    if (slot === "Pitcher") return isPitcher;

    // 2. Hitter Slot Rule: If they are a pitcher, they cannot hit (C, INF, OF, DH)
    if (isPitcher) return false;

    // 3. Designated Hitter Rule: Any non-pitcher can be a DH
    if (slot === "Designated Hitter") return true;

    const isOutfielder = [
      "Left Fielder",
      "Right Fielder",
      "Center Fielder",
      "Outfielder",
      "OF",
    ].includes(playerPos);

    // 4. Infielder accepts multiple positions
    if (slot === "Infielder") {
      return [
        "First Baseman",
        "Second Baseman",
        "Third Baseman",
        "Shortstop",
        "1B",
        "2B",
        "3B",
        "SS",
      ].includes(playerPos);
    }

    if (slot === "Outfielder") return isOutfielder;
    if (slot === "Catcher") return ["Catcher", "C"].includes(playerPos);

    return playerPos === slot;
  };
  const renderSlot = (label: string, searchPos: string, index: number = 0) => {
    const player = players.filter((p) => p.slot === label)[index];

    if (player) {
      const isThisSelected = swappingPlayer?.player_id === player.player_id;
      const canSwapHere =
        swappingPlayer &&
        !isThisSelected &&
        swappingPlayer.slot !== label &&
        isValidForSlot(swappingPlayer.position, label);

      return (
        <View key={`${player.id}-${index}`} style={{ paddingVertical: 5 }}>
          <Text>
            {label}: {player.name} ({player.position})
          </Text>
          <Text style={{ fontWeight: "bold" }}>{player.points || 0} pts</Text>

          {isViewingOwnTeam && (
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              {/* SWAP BUTTON (Disabled during draft) */}
              {!league?.draft && (
                <Button
                  title={
                    isThisSelected ? "CANCEL" : canSwapHere ? `CONFIRM` : "SWAP"
                  }
                  onPress={() => {
                    if (canSwapHere) performSwap(swappingPlayer, player);
                    else setSwappingPlayer(isThisSelected ? null : player);
                  }}
                  color={
                    canSwapHere ? "orange" : isThisSelected ? "red" : "#007bff"
                  }
                />
              )}

              {/* 🔥 DROP BUTTON (Only after draft is complete) */}
              {league?.draft_complete && (
                <View style={{ marginLeft: 10 }}>
                  <Button
                    title="DROP"
                    color="red"
                    onPress={() => handleDropPlayer(player.player_id)}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      );
    }
    const isFreeAgency = league?.draft_complete;
    const isMyTurnToDraft = league?.draft && isUserTurn;
    if (league?.draft && isUserTurn && isViewingOwnTeam) {
      return (
        <View key={`${label}-${index}`} style={{ marginVertical: 5 }}>
          <Button
            title={`Draft ${label}`}
            onPress={() => handleAddPlayerNav(searchPos)}
          />
        </View>
      );
    }
    if (isViewingOwnTeam && (isMyTurnToDraft || isFreeAgency)) {
      return (
        <View key={`${label}-${index}`} style={{ marginVertical: 5 }}>
          <Button
            title={isFreeAgency ? `Add ${label}` : `Draft ${label}`}
            onPress={() => handleAddPlayerNav(searchPos)}
            color={isFreeAgency ? "green" : "#007bff"}
          />
        </View>
      );
    }

    return (
      <View key={`${label}-${index}`} style={{ paddingVertical: 5 }}>
        <Text style={{ color: "gray" }}>
          {label}:{" "}
          {league?.draft
            ? "(Waiting...)"
            : league?.draft_complete
              ? "(Empty)"
              : "(Draft not started)"}
        </Text>
      </View>
    );
  };
  const totalPoints = players
    .filter((p) => p.slot !== "Bench") // Only sum up starters
    .reduce((sum, player) => sum + (Number(player.points) || 0), 0);

  const totalDailyPoints = players
    .filter((p) => p.slot !== "Bench")
    .reduce((sum, player) => sum + (Number(player.points) || 0), 0);

  if (loading) return <ActivityIndicator />;
  if (!team) return <Text>Team not found</Text>;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* {!league?.draft ? (
        <View style={{ backgroundColor: "#ffc107", padding: 10 }}>
          <Text style={{ textAlign: "center", fontWeight: "bold" }}>
            Waiting for Commissioner to start the draft...
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: isUserTurn ? "#28a745" : "#17a2b8",
            padding: 10,
          }}
        >
          <Text
            style={{ textAlign: "center", color: "white", fontWeight: "bold" }}
          >
            {isUserTurn
              ? "YOUR TURN TO PICK!"
              : `Round ${round} - Picking: ${teamOnClock?.username}`}
          </Text>
        </View>
      )} */}
      {/* <Button
        title={refreshing ? "Syncing..." : "Manual Sync (Browser Test)"}
        onPress={onRefresh}
        disabled={refreshing}
      /> */}
      <Text>{team.name}</Text>
      <Text>Owner: {team.username}</Text>
      {/* <Text>Total Team Points</Text>
      <Text>{totalPoints.toFixed(1)} pts</Text> */}
      <View>
        <Text>Season Total Score</Text>
        <Text>
          {Number(team.total_season_points || 0).toFixed(1)} <Text>pts</Text>
        </Text>
      </View>
      <View>
        <View>
          <Text>Today's Active Starters:</Text>
          <Text>{totalDailyPoints.toFixed(1)} pts</Text>
        </View>

        <Button
          title={refreshing ? "Syncing..." : "Sync Points"}
          onPress={onRefresh}
          disabled={refreshing}
        />
      </View>
      <View>
        <Text>CATCHERS</Text>
        {renderSlot("Catcher", "Catcher", 0)}
        {renderSlot("Catcher", "Catcher", 1)}

        <Text>INFIELD</Text>
        {renderSlot("Infielder", "Infielder", 0)}
        {renderSlot("Infielder", "Infielder", 1)}
        {renderSlot("Infielder", "Infielder", 2)}
        {renderSlot("Infielder", "Infielder", 3)}
        {renderSlot("Infielder", "Infielder", 4)}
        {renderSlot("Infielder", "Infielder", 5)}

        <Text>OUTFIELD</Text>
        {[0, 1, 2, 3, 4].map((i) => renderSlot("Outfielder", "Outfielder", i))}

        <Text>UTILITY</Text>
        {renderSlot("Designated Hitter", "Designated Hitter")}

        <Text>PITCHERS</Text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
          renderSlot("Pitcher", "Pitcher", i),
        )}

        <Text>BENCH</Text>

        {/* {players
          .filter((p) => p.slot === "Bench")
          .map((player) => (
            <View key={player.id} style={{ paddingVertical: 5 }}>
              <Text>
                {player.name} ({player.position})
              </Text>

              {isViewingOwnTeam && (
                <>
                  {[
                    "Catcher",
                    "Outfielder",
                    "Infielder",
                    "Pitcher",
                    "Designated Hitter",
                  ]
                    .filter((slot) => isValidForSlot(player.position, slot))
                    .map((slot) => (
                      <Button
                        key={slot}
                        title={`Add to ${slot}`}
                        onPress={() => updateSlot(player.player_id, slot)}
                      />
                    ))}
                </>
              )}
            </View>
          ))} */}
        {[0, 1, 2, 3, 4].map((i) => {
          const benchPlayers = players.filter(
            (p) => p.slot === "Bench" || p.slot === "Any",
          );
          const player = benchPlayers[i];

          if (player) {
            const isThisSelected =
              swappingPlayer?.player_id === player.player_id;
            const canSwapHere =
              swappingPlayer &&
              !isThisSelected &&
              swappingPlayer.slot !== "Bench" && // Cannot start a swap FROM bench TO bench
              swappingPlayer.slot !== "Any" &&
              isValidForSlot(player.position, swappingPlayer.slot);

            console.log("swap player", swappingPlayer?.slot);

            return (
              <View
                key={`bench-slot-${i}`}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text>
                  Bench: {player.name} ({player.position})
                </Text>

                {isViewingOwnTeam && !league?.draft && (
                  <Button
                    title={
                      isThisSelected
                        ? "CANCEL"
                        : canSwapHere
                          ? "SWAP HERE"
                          : "SWAP"
                    }
                    onPress={() => {
                      if (canSwapHere) performSwap(swappingPlayer, player);
                      else setSwappingPlayer(isThisSelected ? null : player);
                    }}
                    color={
                      canSwapHere
                        ? "orange"
                        : isThisSelected
                          ? "red"
                          : "#007bff"
                    }
                    // disabled={swappingPlayer && !isThisSelected && !canSwapHere}
                  />
                )}
              </View>
            );
          }

          // If slot is empty, show the Draft button
          if (league?.draft && isUserTurn && isViewingOwnTeam) {
            return (
              <View key={`bench-empty-${i}`} style={{ marginVertical: 5 }}>
                <Button
                  title={`Draft Bench Spot ${i + 1}`}
                  onPress={() => handleAddPlayerNav("Any")}
                />
              </View>
            );
          }

          return (
            <View key={`bench-waiting-${i}`} style={{ paddingVertical: 5 }}>
              <Text style={{ color: "gray" }}>Bench Slot {i + 1}: Empty</Text>
            </View>
          );
        })}

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
