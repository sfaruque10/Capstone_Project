import API from './api';

export interface Team {
  id: number;
  name: string;
  username: string; // owner username
  user_id: number;
}

export const getTeamById = async (teamId: number): Promise<Team> => {
  const response = await API.get(`/teams/${teamId}`);
  return response.data;
};

// Get players on a team
export const getTeamPlayers = async (teamId: number) => {
  const response = await API.get(`/teams/${teamId}/players`);
  return response.data;
};

// Add player to team
export const addPlayerToTeam = async (teamId: number, playerId: number) => {
  const response = await API.post(`/teams/${teamId}/players`, { playerId });
  return response.data;
};