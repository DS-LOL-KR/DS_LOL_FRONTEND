import { apiClient } from '../../api/client';
import type { Match, MatchHistoryQuery } from './types';

export async function getMatches(query: MatchHistoryQuery): Promise<Match[]> {
  const { data } = await apiClient.get<Match[]>(`/groups/${query.groupId}/matches`, {
    params: { page: query.page },
  });
  return data;
}

export async function getMatch(matchId: string): Promise<Match> {
  const { data } = await apiClient.get<Match>(`/matches/${matchId}`);
  return data;
}
