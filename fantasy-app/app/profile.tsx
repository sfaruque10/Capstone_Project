import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../services/api";
import { getUserTeams } from "../services/user";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // assumes backend route exists: GET /auth/me
        const userRes = await API.get("/auth/me");

        setUser(userRes.data);

        // assumes users service exists
        const teamData = await getUserTeams();
        setTeams(teamData);

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/");
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
        Profile
      </Text>

      {/* User Info */}
      <View
        style={{
          borderWidth: 1,
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          {user?.username}
        </Text>

        <Text>{user?.email}</Text>
      </View>

      {/* Teams */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          marginBottom: 10,
        }}
      >
        My Teams
      </Text>

      {teams.length === 0 ? (
        <Text>No teams yet</Text>
      ) : (
        teams.map((team) => (
          <View
            key={team.id}
            style={{
              borderWidth: 1,
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              {team.name}
            </Text>

            <Text>
              League ID: {team.league_id}
            </Text>

            <Button
              title="View Team"
              onPress={() =>
                router.push({
                  pathname: `/teams/[id]`,
                  params: { id: team.id, leagueId: team.league_id },
                })
              }
            />
          </View>
        ))
      )}

      {/* Logout */}
      <View style={{ marginTop: 30, marginBottom: 50 }}>
        <Button
          title="Logout"
          onPress={logout}
        />
      </View>
    </ScrollView>
  );
}