import { useMutation, useQuery } from '@tanstack/react-query';
import { getTierTable, updateTier } from './api';
import type { UpdateTierRequest } from './types';

export function useTierTable(groupId: string) {
  return useQuery({
    queryKey: ['tiers', groupId],
    queryFn: () => getTierTable(groupId),
    enabled: Boolean(groupId),
  });
}

export function useUpdateTier(groupId: string) {
  return useMutation({
    mutationFn: (payload: UpdateTierRequest) => updateTier(groupId, payload),
  });
}
