import { apiClient } from '../../api/client';
import type {
  CreateMatchRequest,
  FinishMatchRequest,
  Match,
  MatchDetail,
  MatchTeams,
  MmrChange,
  MmrHistoryEntry,
  SubmitEvaluationRequest,
  UpdateTeamsRequest,
} from './types';

export async function getMatches(groupId: string): Promise<Match[]> {
  const { data } = await apiClient.get<Match[]>(`/groups/${groupId}/matches`);
  return data;
}

export async function createMatch(groupId: string, payload: CreateMatchRequest): Promise<Match> {
  const { data } = await apiClient.post<Match>(`/groups/${groupId}/matches`, payload);
  return data;
}

export async function getMatch(matchId: string): Promise<MatchDetail> {
  const { data } = await apiClient.get<MatchDetail>(`/matches/${matchId}`);
  return data;
}

export async function generateTeams(matchId: string): Promise<MatchTeams> {
  const { data } = await apiClient.post<MatchTeams>(`/matches/${matchId}/teams/generate`);
  return data;
}

export async function updateTeams(matchId: string, payload: UpdateTeamsRequest): Promise<MatchTeams> {
  const { data } = await apiClient.patch<MatchTeams>(`/matches/${matchId}/teams`, payload);
  return data;
}

export async function finishMatch(matchId: string, payload: FinishMatchRequest): Promise<MatchDetail> {
  const { data } = await apiClient.post<MatchDetail>(`/matches/${matchId}/finish`, payload);
  return data;
}

export async function submitEvaluation(matchId: string, payload: SubmitEvaluationRequest): Promise<void> {
  await apiClient.post(`/matches/${matchId}/evaluations`, payload);
}

export async function getMmrChanges(matchId: string): Promise<MmrChange[]> {
  const { data } = await apiClient.get<MmrChange[]>(`/matches/${matchId}/mmr-changes`);
  return data;
}

export async function getMyMmrHistory(): Promise<MmrHistoryEntry[]> {
  const { data } = await apiClient.get<MmrHistoryEntry[]>('/users/me/mmr-history');
  return data;
}
