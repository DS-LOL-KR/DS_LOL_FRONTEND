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
    onSuccess: (group) => queryClient.setQueryData(['groups', groupId], group),
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
  return useMutation({ mutationFn: () => leaveGroup(groupId) });
}

export function useTransferOwner(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferOwnerRequest) => transferOwner(groupId, payload),
    onSuccess: (group) => queryClient.setQueryData(['groups', groupId], group),
  });
}
