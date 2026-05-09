import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../services/api";
import { getUserTeams } from "../services/user";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userRes = await API.get("/auth/me");

        setUser(userRes.data);

        const teamData = await getUserTeams();
        setTeams(teamData);

        if (teamData.length > 0) {
          const allTrades = [];

          for (const team of teamData) {
            const tradeRes = await API.get(
              `/trades/team/${team.id}`
            );

            allTrades.push(...tradeRes.data);
          }

          const sortedTrades = allTrades.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          setRecentTrades(sortedTrades.slice(0, 5));
        }

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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#060B16",
        }}
      >
        <ActivityIndicator size="large" color="#C8102E" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#060B16",
      }}
      contentContainerStyle={{
        padding: 20,
      }}
    >
      {/* TOP BAR */}
      <View
        style={{
          backgroundColor: "#0F172A",
          paddingVertical: 18,
          paddingHorizontal: 24,
          borderRadius: 2,
          marginBottom: 22,
          borderWidth: 2,
          borderColor: "#334155",
        }}
      >
        <Text
          style={{
            color: "#F8FAFC",
            fontSize: 34,
            fontFamily: "Oswald_700Bold",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {user?.username}
        </Text>
      </View>

      {/* MAIN CONTENT */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 18,
        }}
      >
        {/* LEFT PROFILE CARD */}
        <View
          style={{
            width: 240,
            backgroundColor: "#0F172A",
            borderRadius: 2,
            padding: 22,
            borderWidth: 2,
            borderColor: "#334155",
          }}
        >
          {/* RED STRIPE */}
          <View
            style={{
              height: 8,
              backgroundColor: "#C8102E",
              marginBottom: 18,
            }}
          />

          {/* PROFILE LETTER */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#1D4ED8",
              alignSelf: "center",
              marginBottom: 18,
              borderWidth: 3,
              borderColor: "#C8102E",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 42,
                fontFamily: "Oswald_700Bold",
                textTransform: "uppercase",
              }}
            >
              {user?.username?.charAt(0)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 26,
              fontFamily: "Oswald_700Bold",
              textAlign: "center",
              color: "#F8FAFC",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {user?.username}
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: "#93C5FD",
              marginTop: 6,
              marginBottom: 24,
              fontSize: 15,
              fontFamily: "Oswald_400Regular",
              letterSpacing: 0.5,
            }}
          >
            Fantasy Baseball Manager
          </Text>

          {/* USER INFO */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                color: "#C8102E",
                marginBottom: 5,
                fontSize: 13,
                fontFamily: "Oswald_700Bold",
                letterSpacing: 1,
              }}
            >
              EMAIL
            </Text>

            <Text
              style={{
                color: "#E2E8F0",
                fontFamily: "Oswald_400Regular",
                fontSize: 16,
              }}
            >
              {user?.email}
            </Text>
          </View>

          {/* NAV BUTTONS */}
          <TouchableOpacity
            onPress={() => router.push("/leagues")}
            style={{
              backgroundColor: "#1D4ED8",
              padding: 14,
              borderRadius: 2,
              marginBottom: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#60A5FA",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Oswald_700Bold",
                letterSpacing: 1,
                fontSize: 16,
              }}
            >
              BROWSE LEAGUES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: "#991B1B",
              padding: 14,
              borderRadius: 2,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#EF4444",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Oswald_700Bold",
                letterSpacing: 1,
                fontSize: 16,
              }}
            >
              LOGOUT
            </Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT CONTENT */}
        <View
          style={{
            flex: 1,
          }}
        >
          {/* TEAMS SECTION */}
          <View
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 2,
              padding: 22,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Oswald_700Bold",
                marginBottom: 18,
                color: "#F8FAFC",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              MY TEAMS
            </Text>

            {teams.length === 0 ? (
              <Text
                style={{
                  color: "#94A3B8",
                  fontFamily: "Oswald_400Regular",
                }}
              >
                No teams yet
              </Text>
            ) : (
              teams.map((team) => (
                <View
                  key={team.id}
                  style={{
                    backgroundColor: "#0B1220",
                    borderWidth: 2,
                    borderColor: "#334155",
                    borderRadius: 2,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  {/* CARD STRIPE */}
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "#C8102E",
                      marginBottom: 14,
                    }}
                  />

                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "Oswald_700Bold",
                      color: "#F8FAFC",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {team.name}
                  </Text>

                  <Text
                    style={{
                      color: "#93C5FD",
                      marginTop: 6,
                      marginBottom: 18,
                      fontFamily: "Oswald_400Regular",
                      fontSize: 16,
                    }}
                  >
                    {team.league_name}
                  </Text>

                  {/* NAVIGATION BUTTONS */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/teams/[id]",
                          params: {
                            id: team.id,
                            leagueId: team.league_id,
                          },
                        })
                      }
                      style={{
                        backgroundColor: "#1D4ED8",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#60A5FA",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Oswald_700Bold",
                          letterSpacing: 0.8,
                        }}
                      >
                        TEAM
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/league/[id]",
                          params: {
                            id: team.league_id,
                          },
                        })
                      }
                      style={{
                        backgroundColor: "#0C2340",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#3B82F6",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Oswald_700Bold",
                          letterSpacing: 0.8,
                        }}
                      >
                        LEAGUE
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: `/trades/${team.id}`,
                          params: {
                            teamId: team.id,
                            leagueId: team.league_id,
                          },
                        })
                      }
                      style={{
                        backgroundColor: "#C8102E",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#F87171",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Oswald_700Bold",
                          letterSpacing: 0.8,
                        }}
                      >
                        TRADES
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ACTIVITY SECTION */}
          <View
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 2,
              padding: 22,
              borderWidth: 2,
              borderColor: "#334155",
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Oswald_700Bold",
                marginBottom: 18,
                color: "#F8FAFC",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              RECENT ACTIVITY
            </Text>

            {recentTrades.length === 0 ? (
              <Text
                style={{
                  color: "#94A3B8",
                  fontFamily: "Oswald_400Regular",
                  fontSize: 16,
                }}
              >
                No recent activity.
              </Text>
            ) : (
              recentTrades.map((trade) => (
                <View
                  key={trade.id}
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 2,
                    borderWidth: 2,
                    borderColor:
                      trade.status === "accepted"
                        ? "#1D4ED8"
                        : trade.status === "rejected"
                        ? "#C8102E"
                        : "#64748B",
                    padding: 16,
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      color: "#F8FAFC",
                      fontFamily: "Oswald_700Bold",
                      fontSize: 20,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    TRADE #{trade.id}
                  </Text>

                  <Text
                    style={{
                      color: "#CBD5E1",
                      fontFamily: "Oswald_400Regular",
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    Team {trade.from_team_id} ↔ Team {trade.to_team_id}
                  </Text>

                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor:
                        trade.status === "accepted"
                          ? "#1D4ED8"
                          : trade.status === "rejected"
                          ? "#C8102E"
                          : "#475569",
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "Oswald_700Bold",
                        fontSize: 13,
                        letterSpacing: 0.8,
                      }}
                    >
                      {trade.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}