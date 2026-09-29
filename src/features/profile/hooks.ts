import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, getUserProfile, linkDiscord, unlinkDiscord, updateProfile, uploadProfileImage } from './api';
import type { UpdateProfileRequest } from './types';

// Shares the ['me'] cache with features/auth's useMe — same GET /users/me resource.
export function useProfile() {
  return useQuery({ queryKey: ['me'], queryFn: getMyProfile });
}

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserProfile(userId),
    enabled: Number.isFinite(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });
}

// 연결/해제 응답 모양에 기대지 않고 ['me']를 다시 불러와서 discordUserId를 갱신함.
export function useLinkDiscord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => linkDiscord(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useUnlinkDiscord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlinkDiscord,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}
