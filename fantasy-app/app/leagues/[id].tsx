import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getLeagueDetails, getLeagueTeams, League, Team } from '../../services/leagues';

const LeagueDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  const [league, setLeagueDetails] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leagueData = await getLeagueDetails(Number(id));
        const teamData = await getLeagueTeams(Number(id));

        setLeagueDetails(leagueData);
        setTeams(teamData);
      } catch (err) {
        console.error('Error fetching league data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <ActivityIndicator />;

  if (!league) return <Text>League not found</Text>;

  return (
    <View>
      <Text>{league.name}</Text>

      <Text>Owner: {league.owner_name}</Text>

      <Text>Teams:</Text>

      {teams.length === 0 ? (
        <Text>No teams yet</Text>
      ) : (
        teams.map((team) => (
          <Text key={team.id}>
            {team.name} — {team.username}
          </Text>
        ))
      )}
    </View>
  );
};

export default LeagueDetailsScreen;