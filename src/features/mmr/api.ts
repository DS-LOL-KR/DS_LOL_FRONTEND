import { apiClient } from '../../api/client';
import type { MmrEntry } from './types';

export async function getMmr(groupId: string): Promise<MmrEntry[]> {
  const { data } = await apiClient.get<MmrEntry[]>(`/groups/${groupId}/mmr`);
  return data;
}

// TODO: confirm whether recalculation is server-triggered only or exposed to clients.
export async function recalculateMmr(groupId: string): Promise<void> {
  await apiClient.post(`/groups/${groupId}/mmr/recalculate`);
}
