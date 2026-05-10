import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
} from "react-native";
import { getLeagues, League } from "../services/leagues";
import { useRouter } from "expo-router";
import Navbar from "./navbar";
import { COLORS } from "../constants/theme";

const LeaguesScreen = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error("Error fetching leagues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView>
        <Button
          title="Create League"
          onPress={() => router.push("/createLeague")}
        />
        <Button
          title="Join League"
          onPress={() => router.push("/joinLeague")}
        />
        {leagues.length === 0 ? (
          <Text>No leagues yet</Text>
        ) : (
          leagues.map((league) => (
            <Text
              key={league.id}
              onPress={() => router.push(`/leagues/${league.id}`)}
            >
              {league.name}
            </Text>
          ))
        )}
      </ScrollView>
      <Navbar />
    </View>
  );
};

export default LeaguesScreen;
