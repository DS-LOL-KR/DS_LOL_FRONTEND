import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMatch,
  deleteMatch,
  duplicateMatchTeams,
  finishMatch,
  generateTeams,
  getMatch,
  getMatches,
  getMmrChanges,
  getMyMmrHistory,
  submitEvaluation,
  updateTeams,
} from './api';
import type { FinishMatchRequest, GenerateTeamsRequest, SubmitEvaluationRequest, UpdateTeamsRequest } from './types';

export function useMatches(groupId: number) {
  return useQuery({
    queryKey: ['matches', groupId],
    queryFn: () => getMatches(groupId),
    enabled: Number.isFinite(groupId),
  });
}

export function useCreateMatch(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createMatch(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', groupId] }),
  });
}

export function useDeleteMatch(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: number) => deleteMatch(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', groupId] }),
  });
}

export function useMatch(matchId: number) {
  return useQuery({
    queryKey: ['matches', 'detail', matchId],
    queryFn: () => getMatch(matchId),
    enabled: Number.isFinite(matchId),
  });
}

export function useGenerateTeams(matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateTeamsRequest) => generateTeams(matchId, payload),
    // The response is the same enriched shape as GET /matches/:id — write it
    // straight into that cache instead of refetching.
    onSuccess: (match) => queryClient.setQueryData(['matches', 'detail', matchId], match),
  });
}

export function useUpdateTeams(matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTeamsRequest) => updateTeams(matchId, payload),
    onSuccess: (match) => queryClient.setQueryData(['matches', 'detail', matchId], match),
  });
}

export function useFinishMatch(matchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinishMatchRequest) => finishMatch(matchId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', 'detail', matchId] }),
  });
}

export function useDuplicateMatchTeams(matchId: number, groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => duplicateMatchTeams(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', groupId] }),
  });
}

export function useSubmitEvaluation(matchId: number) {
  return useMutation({ mutationFn: (payload: SubmitEvaluationRequest) => submitEvaluation(matchId, payload) });
}

export function useMmrChanges(matchId: number) {
  return useQuery({
    queryKey: ['matches', matchId, 'mmr-changes'],
    queryFn: () => getMmrChanges(matchId),
    enabled: Number.isFinite(matchId),
  });
}

export function useMyMmrHistory() {
  return useQuery({ queryKey: ['me', 'mmr-history'], queryFn: getMyMmrHistory });
}
