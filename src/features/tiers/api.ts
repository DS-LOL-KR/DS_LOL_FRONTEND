import { apiClient } from '../../api/client';
import type { Position, TierRefreshResponse, TierTable } from './types';

export async function getTierTable(groupId: number, position?: Position): Promise<TierTable> {
  const { data } = await apiClient.get<TierTable>(`/groups/${groupId}/tiers`, {
    params: position ? { position } : undefined,
  });
  return data;
}

export async function recalculateTiers(groupId: number): Promise<TierTable> {
  const { data } = await apiClient.post<TierTable>(`/groups/${groupId}/tiers/recalculate`);
  return data;
}

// 그룹원 한 명당 약 0.5초(Riot API 호출)라 20명이면 10초쯤 걸려요. 전역 axios에는
// 타임아웃이 없지만(무제한) 끝없이 매달리지 않게 이 요청만 넉넉히 60초로 잡음 —
// 백엔드 안내는 "30초 이상".
const REFRESH_TIMEOUT_MS = 60_000;

export async function refreshGroupTiers(groupId: number): Promise<TierRefreshResponse> {
  const { data } = await apiClient.post<TierRefreshResponse>(`/groups/${groupId}/tiers/refresh`, undefined, {
    timeout: REFRESH_TIMEOUT_MS,
  });
  return data;
}
