import { apiClient } from '../../api/client';
import type { CreateScrimRequest, Scrim } from './types';

export async function createScrim(payload: CreateScrimRequest): Promise<Scrim> {
  const { data } = await apiClient.post<Scrim>('/scrims', payload);
  return data;
}

export async function getScrim(scrimId: string): Promise<Scrim> {
  const { data } = await apiClient.get<Scrim>(`/scrims/${scrimId}`);
  return data;
}
