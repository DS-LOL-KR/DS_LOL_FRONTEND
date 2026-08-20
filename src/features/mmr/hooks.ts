import { useMutation, useQuery } from '@tanstack/react-query';
import { getMmr, recalculateMmr } from './api';

export function useMmr(groupId: string) {
  return useQuery({
    queryKey: ['mmr', groupId],
    queryFn: () => getMmr(groupId),
    enabled: Boolean(groupId),
  });
}

export function useRecalculateMmr(groupId: string) {
  return useMutation({ mutationFn: () => recalculateMmr(groupId) });
}
