import { apiClient } from '../../api/client';
import type { CreateGroupRequest, Group } from './types';

export async function getGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<Group[]>('/groups');
  return data;
}

export async function createGroup(payload: CreateGroupRequest): Promise<Group> {
  const { data } = await apiClient.post<Group>('/groups', payload);
  return data;
}
