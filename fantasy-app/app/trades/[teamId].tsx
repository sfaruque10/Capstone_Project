import {
  useLocalSearchParams,
  useFocusEffect,
  useRouter,
} from "expo-router";

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";

import {
  getTradesForTeam,
  acceptTrade,
  rejectTrade,
  Trade,
} from "../../services/trades";

export default function TradesPage() {
  const { teamId, leagueId } = useLocalSearchParams();
  const router = useRouter();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = async () => {
    try {
      const data = await getTradesForTeam(Number(teamId));
      setTrades(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrades();
    }, [teamId])
  );

  const handleAccept = async (id: number) => {
    await acceptTrade(id);
    loadTrades();
  };

  const handleReject = async (id: number) => {
    await rejectTrade(id);
    loadTrades();
  };

  if (loading) return <ActivityIndicator />;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Trades</Text>

      <Button
        title="Create Trade"
        onPress={() =>
          router.push({
            pathname: "/trades/createTrade",
            params: { teamId, leagueId },
          })
        }
      />

      {trades.map((trade) => (
        <View
          key={trade.id}
          style={{
            marginTop: 20,
            padding: 15,
            borderWidth: 1,
          }}
        >
          <Text>Trade #{trade.id}</Text>
          <Text>Status: {trade.status}</Text>
          <Text>
            {trade.from_team_id} → {trade.to_team_id}
          </Text>

          {trade.status === "pending" && trade.to_team_id === Number(teamId) && (
            <>
              <Button
                title="Accept"
                onPress={() => handleAccept(trade.id)}
              />

              <Button
                title="Reject"
                onPress={() => handleReject(trade.id)}
              />
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}