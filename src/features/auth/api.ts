import { apiClient } from '../../api/client';
import type { LoginRequest, LoginResponse, User } from './types';

// TODO: wire up real Google OAuth login flow.
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}
