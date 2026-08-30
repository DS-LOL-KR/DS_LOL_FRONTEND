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
    // internal_mmr이 여기서 바로 바뀌는데, 티어표(['tiers'])나 각자의 전적
    // 화면(['game-accounts'])은 별도 쿼리라 그냥 두면 "전적에서 지금 갱신"을
    // 눌러야만 반영된 게 보이는 문제가 있었음 — 내전 종료 응답에 이미 groupId가
    // 있으니 그걸로 관련 캐시를 같이 무효화함(2026-08-30).
    onSuccess: (match) => {
      queryClient.setQueryData(['matches', 'detail', matchId], match);
      queryClient.invalidateQueries({ queryKey: ['tiers', match.groupId] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
    },
  });
}

export function useDuplicateMatchTeams(matchId: number, groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => duplicateMatchTeams(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', groupId] }),
  });
}

export function useSubmitEvaluation(matchId: number, groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitEvaluationRequest) => submitEvaluation(matchId, payload),
    // 매너평가도 internal_mmr에 반영되므로 finishMatch와 동일하게 캐시 무효화.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers', groupId] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
    },
  });
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
