import { apiClient } from '../../api/client';
import type { CreateGroupRequest, Group, JoinGroupRequest, Membership, TransferOwnerRequest } from './types';

export async function getGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<{ groups: Group[] }>('/groups');
  return data.groups;
}

export async function createGroup(payload: CreateGroupRequest): Promise<Group> {
  const { data } = await apiClient.post<{ group: Group }>('/groups', payload);
  return data.group;
}

export async function getGroup(groupId: number): Promise<Group> {
  const { data } = await apiClient.get<{ group: Group }>(`/groups/${groupId}`);
  return data.group;
}

export async function deleteGroup(groupId: number): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}

export async function joinGroup(payload: JoinGroupRequest): Promise<Membership> {
  const { data } = await apiClient.post<{ membership: Membership }>('/groups/join', payload);
  return data.membership;
}

export async function refreshInviteCode(groupId: number): Promise<Group> {
  const { data } = await apiClient.post<{ group: Group }>(`/groups/${groupId}/invite-code/refresh`);
  return data.group;
}

export async function kickMember(groupId: number, userId: number): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

export async function leaveGroup(groupId: number): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/me`);
}

export async function transferOwner(groupId: number, payload: TransferOwnerRequest): Promise<Group> {
  const { data } = await apiClient.patch<{ group: Group }>(`/groups/${groupId}/owner`, payload);
  return data.group;
}
