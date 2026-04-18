import API from './api';

export interface League {
  id: number;
  name: string;
  owner_id: number;
}

export const getLeagues = async (): Promise<League[]> => {
  const response = await API.get('/leagues');
  return response.data;
};

export const createLeague = async (name: string) => {
  const response = await API.post('/leagues', { name });
  return response.data;
};

export const joinLeague = async (name: string, league_name: string) => {
  const response = await API.post('/leagues/join', {
    name,
    league_name,
  });
  return response.data;
};