import { apiClient } from '../../api/client';
import type { Position, TierTable } from './types';

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
