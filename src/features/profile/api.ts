import { apiClient } from '../../api/client';
import type { User } from '../auth/types';
import type { UpdateProfileRequest } from './types';

export async function getMyProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}

export async function getUserProfile(userId: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${userId}`);
  return data;
}

// TODO: validate payload with zod before sending.
export async function updateProfile(payload: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me', payload);
  return data;
}

export async function uploadProfileImage(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post<User>('/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
