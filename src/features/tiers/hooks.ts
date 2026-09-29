import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTierTable, refreshGroupTiers } from './api';
import type { Position } from './types';

export function useTierTable(groupId: number, position?: Position) {
  return useQuery({
    queryKey: ['tiers', groupId, position ?? 'ALL'],
    queryFn: () => getTierTable(groupId, position),
    enabled: Number.isFinite(groupId),
  });
}

// 응답의 tiers가 "전체" 탭 데이터 그대로라 그 캐시는 바로 덮어쓰고, 라인별 탭·전적·
// 프로필(MMR이 바뀜)은 다시 불러오게 함.
export function useRefreshGroupTiers(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => refreshGroupTiers(groupId),
    onSuccess: ({ tiers, lastUpdatedAt }) => {
      queryClient.setQueryData(['tiers', groupId, 'ALL'], { tiers, lastUpdatedAt });
      queryClient.invalidateQueries({
        queryKey: ['tiers', groupId],
        predicate: (query) => query.queryKey[2] !== 'ALL',
      });
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
