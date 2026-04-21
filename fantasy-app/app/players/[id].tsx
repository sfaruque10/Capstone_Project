import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getPlayerById } from '../../services/players';

export default function PlayerPage() {
  const { id } = useLocalSearchParams();

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const data = await getPlayerById(Number(id));
        setPlayer(data);
      } catch (err) {
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) return <ActivityIndicator />;
  if (!player) return <Text>Player not found</Text>;

  return (
    <View>
      <Text>{player.name}</Text>
      <Text>Position: {player.position}</Text>
      <Text>Team: {player.team}</Text>
    </View>
  );
}