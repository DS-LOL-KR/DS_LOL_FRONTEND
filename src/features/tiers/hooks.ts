import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTierTable, refreshGroupTiers } from './api';
import type { Position } from './types';
import { STALE_TIME } from '../../api/queryClient';

export function useTierTable(groupId: number, position?: Position) {
  return useQuery({
    queryKey: ['tiers', groupId, position ?? 'ALL'],
    queryFn: () => getTierTable(groupId, position),
    enabled: Number.isFinite(groupId),
    staleTime: STALE_TIME.group,
  });
}

// 응답의 tiers가 "전체" 탭 데이터 그대로라 그 캐시는 바로 덮어쓰고, 라인별 탭·전적·
// 프로필(MMR이 바뀜)은 다시 불러오게 함.
export function useRefreshGroupTiers(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => refreshGroupTiers(groupId),
    // refresh(성공/실패 수)만 빼고 GET /groups/:id/tiers와 같은 모양이라 그대로 넣음 — 예전엔
    // tiers/lastUpdatedAt만 골라 넣어서 나중에 추가된 필드(members)가 캐시에서 빠졌음.
    onSuccess: ({ refresh: _refresh, ...table }) => {
      queryClient.setQueryData(['tiers', groupId, 'ALL'], table);
      queryClient.invalidateQueries({
        queryKey: ['tiers', groupId],
        predicate: (query) => query.queryKey[2] !== 'ALL',
      });
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
