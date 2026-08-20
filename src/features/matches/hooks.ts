import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMatch,
  finishMatch,
  generateTeams,
  getMatch,
  getMatches,
  getMmrChanges,
  getMyMmrHistory,
  submitEvaluation,
  updateTeams,
} from './api';
import type { CreateMatchRequest, FinishMatchRequest, SubmitEvaluationRequest, UpdateTeamsRequest } from './types';

export function useMatches(groupId: string) {
  return useQuery({
    queryKey: ['matches', groupId],
    queryFn: () => getMatches(groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateMatch(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMatchRequest) => createMatch(groupId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', groupId] }),
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', 'detail', matchId],
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId),
  });
}

export function useGenerateTeams(matchId: string) {
  return useMutation({ mutationFn: () => generateTeams(matchId) });
}

export function useUpdateTeams(matchId: string) {
  return useMutation({ mutationFn: (payload: UpdateTeamsRequest) => updateTeams(matchId, payload) });
}

export function useFinishMatch(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinishMatchRequest) => finishMatch(matchId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', 'detail', matchId] }),
  });
}

export function useSubmitEvaluation(matchId: string) {
  return useMutation({ mutationFn: (payload: SubmitEvaluationRequest) => submitEvaluation(matchId, payload) });
}

export function useMmrChanges(matchId: string) {
  return useQuery({
    queryKey: ['matches', matchId, 'mmr-changes'],
    queryFn: () => getMmrChanges(matchId),
    enabled: Boolean(matchId),
  });
}

export function useMyMmrHistory() {
  return useQuery({ queryKey: ['me', 'mmr-history'], queryFn: getMyMmrHistory });
}
