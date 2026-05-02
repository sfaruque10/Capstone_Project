import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";

import { getLeagueTeams } from "../../services/leagues";
import { getTeamPlayers } from "../../services/teams";
import { createTrade } from "../../services/trades";

export default function CreateTradePage() {
  const { teamId, leagueId } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [teams, setTeams] = useState<any[]>([]);
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [theirPlayers, setTheirPlayers] = useState<any[]>([]);

  const [targetTeam, setTargetTeam] = useState<number | null>(null);

  const [offeredPlayers, setOfferedPlayers] = useState<number[]>([]);
  const [requestedPlayers, setRequestedPlayers] = useState<number[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const leagueTeams = await getLeagueTeams(Number(leagueId));
        const roster = await getTeamPlayers(Number(teamId));

        setTeams(
          leagueTeams.filter(
            (team: any) => team.id !== Number(teamId)
          )
        );

        setMyPlayers(roster);
      } catch (err) {
        console.error("Error loading trade page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const chooseOpponent = async (id: number) => {
    try {
      setTargetTeam(id);
      setRequestedPlayers([]);

      const roster = await getTeamPlayers(id);
      setTheirPlayers(roster);
    } catch (err) {
      console.error("Error loading opponent roster:", err);
    }
  };

  const togglePlayer = (
    playerId: number,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (selected.includes(playerId)) {
      setter(selected.filter((id) => id !== playerId));
    } else {
      setter([...selected, playerId]);
    }
  };

  const submitTrade = async () => {
    if (!targetTeam) {
      Alert.alert("Select a team");
      return;
    }

    if (offeredPlayers.length === 0) {
      Alert.alert("Select at least one player to offer");
      return;
    }

    if (requestedPlayers.length === 0) {
      Alert.alert("Select at least one player to request");
      return;
    }

    try {
      setSubmitting(true);

      await createTrade(
        Number(leagueId),
        Number(teamId),
        targetTeam,
        offeredPlayers,
        requestedPlayers
      );

      Alert.alert("Trade created");
      router.back();
    } catch (err) {
      console.error("Trade creation failed:", err);
      Alert.alert("Failed to create trade");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectablePlayer = (
    player: any,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    const active = selected.includes(player.player_id);

    return (
      <TouchableOpacity
        key={player.player_id}
        onPress={() =>
          togglePlayer(player.player_id, selected, setter)
        }
        style={{
          padding: 10,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: "#999",
          backgroundColor: active ? "#d6eaff" : "#fff",
          borderRadius: 6,
        }}
      >
        <Text style={{ fontWeight: "600" }}>
          {player.name}
        </Text>

        <Text>
          {player.position} {player.team ? `• ${player.team}` : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Create Trade
      </Text>

      {/* Opponent Selection */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 10,
        }}
      >
        Select Opponent
      </Text>

      {teams.map((team) => (
        <TouchableOpacity
          key={team.id}
          onPress={() => chooseOpponent(team.id)}
          style={{
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor:
              targetTeam === team.id ? "#333" : "#aaa",
            backgroundColor:
              targetTeam === team.id ? "#efefef" : "#fff",
            borderRadius: 6,
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {team.name}
          </Text>
          <Text>{team.username}</Text>
        </TouchableOpacity>
      ))}

      {/* Offer Players */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        Players You Offer
      </Text>

      {myPlayers.length === 0 ? (
        <Text>No players on roster</Text>
      ) : (
        myPlayers.map((player) =>
          renderSelectablePlayer(
            player,
            offeredPlayers,
            setOfferedPlayers
          )
        )
      )}

      {/* Requested Players */}
      {targetTeam && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Players You Request
          </Text>

          {theirPlayers.length === 0 ? (
            <Text>No players on opponent roster</Text>
          ) : (
            theirPlayers.map((player) =>
              renderSelectablePlayer(
                player,
                requestedPlayers,
                setRequestedPlayers
              )
            )
          )}
        </>
      )}

      <View style={{ marginTop: 25, marginBottom: 40 }}>
        <Button
          title={
            submitting ? "Submitting..." : "Submit Trade"
          }
          onPress={submitTrade}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
}