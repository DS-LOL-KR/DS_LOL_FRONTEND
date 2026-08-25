import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, getUserProfile, updateProfile, uploadProfileImage } from './api';
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
