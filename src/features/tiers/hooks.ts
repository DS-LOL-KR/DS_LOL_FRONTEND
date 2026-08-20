import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTierTable, recalculateTiers } from './api';
import type { Lane } from './types';

export function useTierTable(groupId: string, position?: Lane) {
  return useQuery({
    queryKey: ['tiers', groupId, position ?? 'ALL'],
    queryFn: () => getTierTable(groupId, position),
    enabled: Boolean(groupId),
  });
}

export function useRecalculateTiers(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recalculateTiers(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers', groupId] }),
  });
}
