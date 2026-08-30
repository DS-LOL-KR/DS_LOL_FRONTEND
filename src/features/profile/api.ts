import { apiClient } from '../../api/client';
import type { User } from '../auth/types';
import type { PublicGameAccount, UpdateProfileRequest } from './types';

export async function getMyProfile(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>('/users/me');
  return data.user;
}

export type UserProfile = Omit<User, 'email'> & { gameAccounts: PublicGameAccount[] };

// GET /users/:id omits `email` (other users' profiles are public, email is not).
export async function getUserProfile(userId: number): Promise<UserProfile> {
  const { data } = await apiClient.get<{ user: UserProfile }>(`/users/${userId}`);
  return data.user;
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.patch<{ user: User }>('/users/me', payload);
  return data.user;
}

// TODO: POST /users/me/profile-image is still a stub server-side (multipart field
// name not finalized) — this call matches the 설계안 but may need adjusting once
// that endpoint is actually implemented.
export async function uploadProfileImage(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ user: User }>('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.user;
}
