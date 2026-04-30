import API from "./api";

export interface League {
  id: number;
  name: string;
  owner_name: string;
}

export const getLeagues = async (): Promise<League[]> => {
  const response = await API.get("/leagues");
  return response.data;
};

export const createLeague = async (name: string) => {
  const response = await API.post("/leagues", { name });
  return response.data;
};

export const joinLeague = async (name: string, league_name: string) => {
  const response = await API.post("/leagues/join", {
    name,
    league_name,
  });
  return response.data;
};

export const getLeagueDetails = async (id: number) => {
  const response = await API.get(`/leagues/${id}`);
  return response.data;
};

export interface Team {
  id: number;
  name: string;
  username: string;
  user_id: number;
  draft_order: number;
}

export const getLeagueTeams = async (leagueId: number): Promise<Team[]> => {
  const response = await API.get(`/leagues/${leagueId}/teams`);
  return response.data;
};
