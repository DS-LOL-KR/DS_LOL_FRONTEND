import { apiClient } from '../../api/client';
import type { CreateGroupRequest, Group, GroupDetail, JoinGroupRequest } from './types';

export async function getGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<Group[]>('/groups');
  return data;
}

export async function createGroup(payload: CreateGroupRequest): Promise<Group> {
  const { data } = await apiClient.post<Group>('/groups', payload);
  return data;
}

export async function getGroup(groupId: string): Promise<GroupDetail> {
  const { data } = await apiClient.get<GroupDetail>(`/groups/${groupId}`);
  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}

export async function joinGroup(payload: JoinGroupRequest): Promise<Group> {
  const { data } = await apiClient.post<Group>('/groups/join', payload);
  return data;
}

export async function refreshInviteCode(groupId: string): Promise<{ inviteCode: string }> {
  const { data } = await apiClient.post<{ inviteCode: string }>(`/groups/${groupId}/invite-code/refresh`);
  return data;
}

export async function kickMember(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

export async function leaveGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/me`);
}

export async function transferOwner(groupId: string, userId: string): Promise<void> {
  await apiClient.patch(`/groups/${groupId}/owner`, { userId });
}
