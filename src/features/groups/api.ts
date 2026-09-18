import { apiClient } from '../../api/client';
import type {
  CreateGroupRequest,
  Group,
  GroupDetail,
  JoinGroupRequest,
  Membership,
  TransferOwnerRequest,
  UpdateDiscordWebhookRequest,
} from './types';

export async function getGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<{ groups: Group[] }>('/groups');
  return data.groups;
}

export async function createGroup(payload: CreateGroupRequest): Promise<Group> {
  const { data } = await apiClient.post<{ group: Group }>('/groups', payload);
  return data.group;
}

export async function getGroup(groupId: number): Promise<GroupDetail> {
  const { data } = await apiClient.get<{ group: GroupDetail }>(`/groups/${groupId}`);
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

export async function updateDiscordWebhook(groupId: number, payload: UpdateDiscordWebhookRequest): Promise<Group> {
  const { data } = await apiClient.patch<{ group: Group }>(`/groups/${groupId}/discord-webhook`, payload);
  return data.group;
}

// "봇 초대 → 그룹 자동 연동" 흐름의 시작점 — 이 URL로 브라우저를 이동시키면
// 사용자가 디스코드에서 서버 선택/승인을 마치는 순간 자동으로 group.discordGuildId가
// 채워짐(백엔드 discord.controller.ts의 OAuth 콜백).
export async function getDiscordInviteUrl(groupId: number): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(`/groups/${groupId}/discord-guild/invite-url`);
  return data.url;
}
