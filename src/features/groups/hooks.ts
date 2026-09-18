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
import type { CreateGroupRequest, JoinGroupRequest, TransferOwnerRequest, UpdateDiscordWebhookRequest } from './types';
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
