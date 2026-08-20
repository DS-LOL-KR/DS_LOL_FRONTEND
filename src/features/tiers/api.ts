import { apiClient } from '../../api/client';
import type { Lane, TierEntry } from './types';

export async function getTierTable(groupId: string, position?: Lane): Promise<TierEntry[]> {
  const { data } = await apiClient.get<TierEntry[]>(`/groups/${groupId}/tiers`, {
    params: position ? { position } : undefined,
  });
  return data;
}

export async function recalculateTiers(groupId: string): Promise<TierEntry[]> {
  const { data } = await apiClient.post<TierEntry[]>(`/groups/${groupId}/tiers/recalculate`);
  return data;
}
