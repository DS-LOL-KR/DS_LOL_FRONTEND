import { apiClient } from '../../api/client';
import type { Profile, UpdateProfileRequest } from './types';

export async function getProfile(): Promise<Profile> {
  const { data } = await apiClient.get<Profile>('/profile');
  return data;
}

// TODO: validate payload with zod before sending.
export async function updateProfile(payload: UpdateProfileRequest): Promise<Profile> {
  const { data } = await apiClient.patch<Profile>('/profile', payload);
  return data;
}
