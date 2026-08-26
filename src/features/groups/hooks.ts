import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  joinGroup,
  kickMember,
  leaveGroup,
  refreshInviteCode,
  transferOwner,
} from './api';
import type { CreateGroupRequest, JoinGroupRequest, TransferOwnerRequest } from './types';

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
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
