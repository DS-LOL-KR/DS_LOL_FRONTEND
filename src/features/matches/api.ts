import { apiClient } from '../../api/client';
import type {
  Evaluation,
  FinishMatchRequest,
  GenerateTeamsRequest,
  Match,
  MmrChange,
  MmrHistoryEntry,
  SubmitEvaluationRequest,
  UpdateTeamsRequest,
} from './types';

export async function getMatches(groupId: number): Promise<Match[]> {
  const { data } = await apiClient.get<{ matches: Match[] }>(`/groups/${groupId}/matches`);
  return data.matches;
}

// Request body is currently empty — the group's game is already fixed, and
// nothing else is configurable at creation time per the spec.
export async function createMatch(groupId: number): Promise<Match> {
  const { data } = await apiClient.post<{ match: Match }>(`/groups/${groupId}/matches`, {});
  return data.match;
}

export async function getMatch(matchId: number): Promise<Match> {
  const { data } = await apiClient.get<{ match: Match }>(`/matches/${matchId}`);
  return data.match;
}

export async function deleteMatch(matchId: number): Promise<void> {
  await apiClient.delete(`/matches/${matchId}`);
}

export async function generateTeams(matchId: number, payload: GenerateTeamsRequest): Promise<Match> {
  const { data } = await apiClient.post<{ match: Match }>(`/matches/${matchId}/teams/generate`, payload);
  return data.match;
}

export async function updateTeams(matchId: number, payload: UpdateTeamsRequest): Promise<Match> {
  const { data } = await apiClient.patch<{ match: Match }>(`/matches/${matchId}/teams`, payload);
  return data.match;
}

export async function finishMatch(matchId: number, payload: FinishMatchRequest): Promise<Match> {
  const { data } = await apiClient.post<{ match: Match }>(`/matches/${matchId}/finish`, payload);
  return data.match;
}

export async function duplicateMatchTeams(matchId: number): Promise<Match> {
  const { data } = await apiClient.post<{ match: Match }>(`/matches/${matchId}/duplicate-teams`);
  return data.match;
}

export async function submitEvaluation(matchId: number, payload: SubmitEvaluationRequest): Promise<Evaluation> {
  const { data } = await apiClient.post<{ evaluation: Evaluation }>(`/matches/${matchId}/evaluations`, payload);
  return data.evaluation;
}

// 이 매치에서 내가(로그인한 유저) 이미 평가 제출을 마친 팀원 targetId 목록.
// 새로고침/재방문해도 이미 평가한 사람에게 평가 모달이 다시 뜨는 걸 막으려고 씀.
export async function getMyEvaluatedTargetIds(matchId: number): Promise<number[]> {
  const { data } = await apiClient.get<{ targetIds: number[] }>(`/matches/${matchId}/evaluations/me`);
  return data.targetIds;
}

export async function getMmrChanges(matchId: number): Promise<MmrChange[]> {
  const { data } = await apiClient.get<{ changes: MmrChange[] }>(`/matches/${matchId}/mmr-changes`);
  return data.changes;
}

// groupId 없이 부르면 유저가 속한 모든 그룹의 내전이 섞여서 나옴 — StatsPage의
// "그룹 내부 티어"는 activeGroupId 기준인데 이 MMR 추이만 다른 그룹 걸 보여주던
// 버그 수정용(2026-09-13). 그룹 화면에서 볼 땐 반드시 groupId를 넘길 것.
export async function getMyMmrHistory(groupId?: number): Promise<MmrHistoryEntry[]> {
  const { data } = await apiClient.get<{ history: MmrHistoryEntry[] }>('/users/me/mmr-history', {
    params: { groupId },
  });
  return data.history;
}
