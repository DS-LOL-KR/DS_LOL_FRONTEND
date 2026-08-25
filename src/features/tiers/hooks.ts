import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTierTable, recalculateTiers } from './api';
import type { Position } from './types';

export function useTierTable(groupId: number, position?: Position) {
  return useQuery({
    queryKey: ['tiers', groupId, position ?? 'ALL'],
    queryFn: () => getTierTable(groupId, position),
    enabled: Number.isFinite(groupId),
  });
}

export function useRecalculateTiers(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recalculateTiers(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers', groupId] }),
  });
}
