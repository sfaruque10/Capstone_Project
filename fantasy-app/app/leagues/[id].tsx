import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Alert,
  Platform,
} from "react-native";
import {
  getLeagueDetails,
  getLeagueTeams,
  lockLeaguePermanently,
  startLeagueDraft,
  League,
  Team,
} from "../../services/leagues";
import { getCurrentUser } from "@/services/user";

const LeagueDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  const [league, setLeagueDetails] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Track user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leagueData = await getLeagueDetails(Number(id));
        const teamData = await getLeagueTeams(Number(id));
        const userData = await getCurrentUser();

        setLeagueDetails(leagueData);
        setTeams(teamData);

        if (userData) {
          setCurrentUserId(userData.id);
        }
      } catch (err) {
        console.error("Error fetching league data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleLock = async () => {
    try {
      const response = await lockLeaguePermanently(Number(id));

      // Extract the first object from the response array
      const updatedRow = Array.isArray(response) ? response[0] : response;

      if (updatedRow) {
        setLeagueDetails((prev) => {
          if (!prev) return updatedRow;
          return {
            ...prev,
            ...updatedRow, // This specifically updates team_add
          };
        });

        Alert.alert(
          "Success",
          updatedRow.team_add ? "League Unlocked" : "League Locked",
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
      Alert.alert("Error", "Could not update league status");
    }
  };
  const handleStartDraft = async () => {
    try {
      const response = await startLeagueDraft(Number(id));
      const updatedRow = Array.isArray(response) ? response[0] : response;

      if (updatedRow) {
        setLeagueDetails((prev) =>
          prev ? { ...prev, ...updatedRow } : updatedRow,
        );
        // Refresh teams to get the new randomized draft order
        const updatedTeams = await getLeagueTeams(Number(id));
        setTeams(updatedTeams);

        Alert.alert("Success", "Draft has officially started!");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Check if league is locked and you have at least 2 teams.",
      );
    }
  };
  if (loading) return <ActivityIndicator />;
  console.log(teams);
  if (!league) return <Text>League not found</Text>;
  const isOwner = currentUserId === league.owner_id;
  console.log(isOwner, currentUserId, league.owner_id);
  const isLocked = league.team_add === false;
  console.log(isLocked, league.team_add);
  const teamsByDraftOrder = [...teams].sort(
    (a, b) => a.draft_order - b.draft_order,
  );
  const teamsByStandings = [...teams].sort(
    (a, b) => (b.total_season_points || 0) - (a.total_season_points || 0),
  );
  return (
    <View>
      <Text>{league.name}</Text>

      <Text>Owner: {league.owner_name}</Text>
      <Text>
        Status:{" "}
        {league.team_add
          ? "Open (Joining Allowed)"
          : "Locked (Joining Disabled)"}
      </Text>
      {isOwner && !isLocked && (
        <Button
          title="Lock League Permanently"
          onPress={() => {
            if (Platform.OS === "web") {
              if (window.confirm("Lock league? No more teams can join."))
                handleToggleLock();
            } else {
              Alert.alert("Permanent Action", "Lock league?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Lock Forever",
                  onPress: handleToggleLock,
                  style: "destructive",
                },
              ]);
            }
          }}
          color="red"
        />
      )}

      {isOwner &&
        isLocked &&
        !league.draft &&
        !league.draft_complete &&
        teams.length > 0 && (
          <View>
            <Text>All teams in? Start the draft!</Text>
            <Button
              title="Start Draft Mode"
              onPress={handleStartDraft}
              color="blue"
            />
          </View>
        )}

      {league.draft && (
        <View>
          <Text>Draft is in Progress!</Text>
          <Button
            title="Go to Your Team's Draft Room"
            onPress={() => {
              // Find the team in this league that belongs to the current user
              const userTeam = teams.find((t) => t.user_id === currentUserId);

              if (userTeam) {
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: userTeam.id, leagueId: id },
                });
              } else {
                Alert.alert("Error", "You don't have a team in this league.");
              }
            }}
            color="green"
          />
        </View>
      )}
      {league.draft_complete && (
        <View
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: "#6c757d",
              textAlign: "center",
            }}
          >
            Season is Active - Draft Complete
          </Text>
          <Button
            title="Go to My Roster"
            onPress={() => {
              // Find the team in this league that belongs to the current user
              const userTeam = teams.find((t) => t.user_id === currentUserId);

              if (userTeam) {
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: userTeam.id, leagueId: id },
                });
              } else {
                // Fallback in case they are just a league observer
                Alert.alert(
                  "Notice",
                  "You are viewing this league as a guest.",
                );
              }
            }}
            color="#6c757d"
          />
        </View>
      )}
      {!league.draft_complete ? (
        <View>
          <Text>Teams (Draft Order):</Text>
          {teams.map((team) => (
            <Button
              key={team.id}
              title={`${team.draft_order + 1}. ${team.name} (@${team.username})`}
              onPress={() =>
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: team.id, leagueId: id },
                })
              }
            />
          ))}
        </View>
      ) : (
        // SHOW STANDINGS (Once draft is finished)
        <View>
          <Text>League Standings</Text>
          <View>
            {/* Header */}
            <View>
              <Text>#</Text>
              <Text>Team</Text>
              <Text>Points</Text>
            </View>

            {/* Rows */}
            {teamsByStandings.map((team, index) => (
              <View key={team.id}>
                <Text>{index + 1}</Text>
                <View>
                  <Text
                    onPress={() =>
                      router.push({
                        pathname: `/teams/[id]`,
                        params: { id: team.id, leagueId: id },
                      })
                    }
                  >
                    {team.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "gray" }}>
                    @{team.username}
                  </Text>
                </View>
                <Text>{Number(team.total_season_points || 0).toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default LeagueDetailsScreen;
