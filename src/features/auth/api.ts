import { apiClient } from '../../api/client';
import type { User } from './types';

// GET /auth/google is a server-side redirect into Google's OAuth consent screen,
// not a fetchable JSON endpoint — navigate the browser to it directly.
export function googleLoginUrl(): string {
  return `${apiClient.defaults.baseURL}/auth/google`;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>('/users/me');
  return data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
