import { useMutation, useQuery } from '@tanstack/react-query';
import { getProfile, updateProfile } from './api';

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: getProfile });
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile });
}
