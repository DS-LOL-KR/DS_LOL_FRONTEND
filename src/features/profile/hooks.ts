import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, getUserProfile, linkDiscord, unlinkDiscord, updateProfile, uploadProfileImage } from './api';
import type { UpdateProfileRequest } from './types';
import { STALE_TIME } from '../../api/queryClient';

// Shares the ['me'] cache with features/auth's useMe — same GET /users/me resource.
export function useProfile() {
  return useQuery({ queryKey: ['me'], queryFn: getMyProfile, staleTime: STALE_TIME.account });
}

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserProfile(userId),
    staleTime: STALE_TIME.group,
    enabled: Number.isFinite(userId),
  });
}

// 닉네임/프로필 사진은 그룹원 목록·티어표·남이 보는 내 프로필에도 같이 나와서, 캐시를 오래
// 두게 바꾼 뒤로는(2026-11-03) 바꾼 직후 그 화면들에 예전 값이 남지 않게 같이 다시 받음.
function invalidateNicknameViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['groups'] });
  queryClient.invalidateQueries({ queryKey: ['tiers'] });
  queryClient.invalidateQueries({ queryKey: ['users'] });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      invalidateNicknameViews(queryClient);
    },
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      invalidateNicknameViews(queryClient);
    },
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
