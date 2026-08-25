import { apiClient } from '../../api/client';
import type {
  Evaluation,
  FinishMatchRequest,
  FinishMatchResult,
  GenerateTeamsRequest,
  Match,
  MatchTeamsResult,
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

export async function generateTeams(matchId: number, payload: GenerateTeamsRequest): Promise<MatchTeamsResult> {
  const { data } = await apiClient.post<{ match: MatchTeamsResult }>(`/matches/${matchId}/teams/generate`, payload);
  return data.match;
}

export async function updateTeams(matchId: number, payload: UpdateTeamsRequest): Promise<MatchTeamsResult> {
  const { data } = await apiClient.patch<{ match: MatchTeamsResult }>(`/matches/${matchId}/teams`, payload);
  return data.match;
}

export async function finishMatch(matchId: number, payload: FinishMatchRequest): Promise<FinishMatchResult> {
  const { data } = await apiClient.post<{ match: FinishMatchResult }>(`/matches/${matchId}/finish`, payload);
  return data.match;
}

export async function submitEvaluation(matchId: number, payload: SubmitEvaluationRequest): Promise<Evaluation> {
  const { data } = await apiClient.post<{ evaluation: Evaluation }>(`/matches/${matchId}/evaluations`, payload);
  return data.evaluation;
}

export async function getMmrChanges(matchId: number): Promise<MmrChange[]> {
  const { data } = await apiClient.get<{ changes: MmrChange[] }>(`/matches/${matchId}/mmr-changes`);
  return data.changes;
}

export async function getMyMmrHistory(): Promise<MmrHistoryEntry[]> {
  const { data } = await apiClient.get<{ history: MmrHistoryEntry[] }>('/users/me/mmr-history');
  return data.history;
}
