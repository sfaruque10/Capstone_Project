import API from './api';

export interface User {
  id: number;
  username: string;
  email: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await API.get('/auth/me');
  return response.data;
};