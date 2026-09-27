import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  deleteGroup,
  getDiscordInviteUrl,
  getGroup,
  getGroups,
  joinGroup,
  kickMember,
  leaveGroup,
  refreshInviteCode,
  transferOwner,
  updateDiscordWebhook,
} from './api';
import type {
  CreateGroupRequest,
  GroupMember,
  JoinGroupRequest,
  TransferOwnerRequest,
  UpdateDiscordWebhookRequest,
} from './types';
import { useTierTable } from '../tiers/hooks';
import { clearActiveGroupIdIfMatches } from '../../utils/activeGroup';

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: getGroups });
}

export function useGroup(groupId: number) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroup(groupId),
    enabled: Number.isFinite(groupId),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupRequest) => createGroup(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinGroupRequest) => joinGroup(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useDeleteGroup(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      clearActiveGroupIdIfMatches(groupId);
    },
  });
}

export function useRefreshInviteCode(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => refreshInviteCode(groupId),
    // The refresh response is the bare Group (no `members`) — invalidate instead
    // of setQueryData so the cached GroupDetail's roster isn't wiped out.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useKickMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => kickMember(groupId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useLeaveGroup(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      clearActiveGroupIdIfMatches(groupId);
    },
  });
}

export function useTransferOwner(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferOwnerRequest) => transferOwner(groupId, payload),
    // Same reasoning as useRefreshInviteCode — the response has no `members`.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useUpdateDiscordWebhook(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDiscordWebhookRequest) => updateDiscordWebhook(groupId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

// 클릭하면 URL을 받아서 그 자리에서 바로 디스코드로 이동함(window.location.href) —
// 그래야 브라우저가 "우리 서버 → 디스코드"로 진짜 이동한 상태가 되고, 승인 후
// 디스코드가 우리 백엔드로 리다이렉트해줄 수 있음(새 탭/팝업이면 이 흐름이 안 됨).
export function useDiscordInviteUrl(groupId: number) {
  return useMutation({
    mutationFn: () => getDiscordInviteUrl(groupId),
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}

// GET /groups/:id gives role/joinedAt/nickname/profile image; GET /groups/:id/tiers
// gives per-line tier/MMR. Neither alone has everything a roster wants, so merge
// by userId — picking each member's most-played line as their "주 라인" row
// (tier/mmr은 라인 무관 계정 전체 값이라 어느 행에서 가져와도 동일함).
// 유저가 프로필에서 주라인을 직접 지정했으면 그걸 최우선으로 쓰고, 없으면 판수(승+패)가
// 가장 많은 라인으로 자동 추론(2026-09-12).
export function useGroupMembers(groupId: number) {
  const groupQuery = useGroup(groupId);
  const tierQuery = useTierTable(groupId);
  const group = groupQuery.data;
  const tierRows = tierQuery.data;

  const members: GroupMember[] = useMemo(() => {
    if (!group) return [];
    return group.members.map((membership) => {
      const rows = (tierRows?.tiers ?? []).filter((row) => row.userId === membership.userId);
      const mainRow = rows.length
        ? rows.reduce((best, row) => (row.wins + row.losses > best.wins + best.losses ? row : best))
        : null;
      const mainLane = rows[0]?.mainPosition ?? mainRow?.position ?? null;
      return {
        userId: membership.userId,
        nickname: membership.user.nickname,
        profileImageUrl: membership.user.profileImageUrl,
        isOwner: membership.role === 'OWNER',
        internalTier: mainRow?.tier ?? null,
        mainLane,
        mmr: mainRow?.internalMmr ?? null,
        joinedAt: membership.joinedAt,
      };
    });
  }, [group, tierRows]);

  return { group, members, tierTable: tierRows, isLoading: groupQuery.isLoading || tierQuery.isLoading, groupQuery, tierQuery };
}
