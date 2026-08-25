import { apiClient } from '../../api/client';
import type { Position, TierEntry } from './types';

export async function getTierTable(groupId: number, position?: Position): Promise<TierEntry[]> {
  const { data } = await apiClient.get<{ tiers: TierEntry[] }>(`/groups/${groupId}/tiers`, {
    params: position ? { position } : undefined,
  });
  return data.tiers;
}

export async function recalculateTiers(groupId: number): Promise<TierEntry[]> {
  const { data } = await apiClient.post<{ tiers: TierEntry[] }>(`/groups/${groupId}/tiers/recalculate`);
  return data.tiers;
}
