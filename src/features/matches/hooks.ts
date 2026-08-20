import { useQuery } from '@tanstack/react-query';
import { getMatch, getMatches } from './api';
import type { MatchHistoryQuery } from './types';

export function useMatches(query: MatchHistoryQuery) {
  return useQuery({
    queryKey: ['matches', query],
    queryFn: () => getMatches(query),
    enabled: Boolean(query.groupId),
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'detail', matchId],
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId),
  });
}
