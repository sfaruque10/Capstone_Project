import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Button } from 'react-native';
import { getTeamById, Team } from '../../services/teams';
import API from '../../services/api';

interface TeamPlayer {
  id: number;
  player_id: number;
  name: string;
  position: string;
  team: string;
  slot: string;
}

export default function TeamPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamData = await getTeamById(Number(id));

        const rosterRes = await API.get(`/teams/${id}/players`);
        const rosterData = rosterRes.data;

        setTeam(teamData);
        setPlayers(rosterData);
      } catch (err) {
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  if (loading) return <ActivityIndicator />;
  if (!team) return <Text>Team not found</Text>;

  // 🔥 Group players by slot
  const grouped = {
    P: players.filter(p => p.slot === 'P'),
    C: players.filter(p => p.slot === 'C'),
    INFIELD: players.filter(p =>
      ['1B', '2B', '3B', 'SS'].includes(p.slot)
    ),
    OF: players.filter(p => p.slot === 'OF'),
    UTIL: players.filter(p => p.slot === 'UTIL'),
    BENCH: players.filter(p => p.slot === 'BENCH'),
  };

  const renderSection = (title: string, data: TeamPlayer[]) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{title}</Text>

      {data.length === 0 ? (
        <Text style={{ color: 'gray' }}>No players</Text>
      ) : (
        data.map(player => (
          <Text key={player.id}>
            {player.slot}: {player.name} ({player.position})
          </Text>
        ))
      )}
    </View>
  );

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Team Info */}
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
        {team.name}
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Owner: {team.username}
      </Text>

      {/* Add Player Button (prep for next step) */}
      <Button
        title="Add Player"
        onPress={() => router.push('/players')}
      />

      {/* Roster Sections */}
      {renderSection('Pitchers', grouped.P)}
      {renderSection('Catchers', grouped.C)}
      {renderSection('Infield', grouped.INFIELD)}
      {renderSection('Outfield', grouped.OF)}
      {renderSection('Utility', grouped.UTIL)}
      {renderSection('Bench', grouped.BENCH)}
    </ScrollView>
  );
}