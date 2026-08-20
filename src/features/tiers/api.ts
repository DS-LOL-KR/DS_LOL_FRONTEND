import { apiClient } from '../../api/client';
import type { TierEntry, UpdateTierRequest } from './types';

export async function getTierTable(groupId: string): Promise<TierEntry[]> {
  const { data } = await apiClient.get<TierEntry[]>(`/groups/${groupId}/tiers`);
  return data;
}

export async function updateTier(groupId: string, payload: UpdateTierRequest): Promise<TierEntry> {
  const { data } = await apiClient.put<TierEntry>(`/groups/${groupId}/tiers`, payload);
  return data;
}
