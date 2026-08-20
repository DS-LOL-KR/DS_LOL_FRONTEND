import { apiClient } from '../../api/client';
import type { Rating, SubmitRatingRequest } from './types';

export async function getRatings(matchId: string): Promise<Rating[]> {
  const { data } = await apiClient.get<Rating[]>(`/matches/${matchId}/ratings`);
  return data;
}

export async function submitRating(payload: SubmitRatingRequest): Promise<Rating> {
  const { data } = await apiClient.post<Rating>('/ratings', payload);
  return data;
}
