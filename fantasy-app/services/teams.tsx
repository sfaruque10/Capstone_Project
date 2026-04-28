import API from "./api";

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
export const addPlayerToTeam = async (
  teamId: number,
  player: any,
  position: string,
) => {
  await API.post("/players", {
    id: player.id, // This matches your FK
    name: player.fullName,
    position: player?.position?.displayName || "N/A",
    // name: player.fullName,
    // position: player.position
  });
  const response = await API.post(`/teams/${teamId}/players`, {
    player_id: Number(player.id),
    slot: position,
  });
  return response.data;
};

// export const getTeamOwner = async (teamId: number, userId: number) => {
//   const response = await API.get(`/`)

//   // const response = await API.get(`/teams/${teamId}/user_id`)
// };
