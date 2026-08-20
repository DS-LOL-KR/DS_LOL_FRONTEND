import { useMutation, useQuery } from '@tanstack/react-query';
import { getRatings, submitRating } from './api';

export function useRatings(matchId: string) {
  return useQuery({
    queryKey: ['ratings', matchId],
    queryFn: () => getRatings(matchId),
    enabled: Boolean(matchId),
  });
}

export function useSubmitRating() {
  return useMutation({ mutationFn: submitRating });
}
