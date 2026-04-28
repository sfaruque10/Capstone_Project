import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import { getTeamById, Team } from "../../services/teams";
import { getCurrentUser } from "@/services/user";
import API from "../../services/api";

interface TeamPlayer {
  id: number;
  player_id: number;
  name: string;
  position: string;
  team: string;
  slot: string; // The database column that saves "First Base", "Infielder", etc.
}

export default function TeamPage() {
  const { id, leagueId } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [leagueDraftedIds, setLeagueDraftedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchTeamData = async () => {
        try {
          const teamData = await getTeamById(Number(id));
          const rosterRes = await API.get(`/teams/${id}/players`);
          const userIdData = await getCurrentUser();
          const leagueRosterRes = await API.get(
            `/leagues/${leagueId}/drafted-players`,
          );
          setTeam(teamData);
          setPlayers(rosterRes.data);
          setLeagueDraftedIds(leagueRosterRes.data);
          setCurrentUser(userIdData.id);
        } catch (err) {
          console.error("Error fetching team data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchTeamData();
    }, [id, leagueId]),
  );

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

  const renderSlot = (label: string, searchPos: string, index: number = 0) => {
    const matchingPlayers = players.filter((p) => p.slot === label);
    const player = matchingPlayers[index];
    const isOwner = currentUser === team?.user_id;

    if (player) {
      return (
        <View key={`${player.id}-${index}`}>
          <Text>
            {label}: {player.name} ({player.position})
          </Text>
        </View>
      );
    }

    if (isOwner) {
      return (
        <View key={`${label}-${index}`}>
          <Button
            title={`Add ${label}`}
            onPress={() => handleAddPlayerNav(searchPos)}
          />
        </View>
      );
    }

    return null;
  };

  if (loading) return <ActivityIndicator />;
  if (!team) return <Text>Team not found</Text>;

  return (
    <ScrollView>
      <Text>{team.name}</Text>
      <Text>Owner: {team.username}</Text>

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
      </View>
    </ScrollView>
  );
}
