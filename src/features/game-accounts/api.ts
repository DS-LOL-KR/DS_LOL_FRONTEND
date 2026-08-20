import { apiClient } from '../../api/client';
import type {
  ChampionMastery,
  ChampionStat,
  Game,
  GameAccount,
  GameAccountStats,
  LinkGameAccountRequest,
  MatchHistoryEntry,
} from './types';

export async function getGames(): Promise<Game[]> {
  const { data } = await apiClient.get<Game[]>('/games');
  return data;
}

export async function getMyGameAccounts(): Promise<GameAccount[]> {
  const { data } = await apiClient.get<GameAccount[]>('/users/me/game-accounts');
  return data;
}

export async function linkGameAccount(payload: LinkGameAccountRequest): Promise<GameAccount> {
  const { data } = await apiClient.post<GameAccount>('/users/me/game-accounts', payload);
  return data;
}

export async function unlinkGameAccount(accountId: string): Promise<void> {
  await apiClient.delete(`/users/me/game-accounts/${accountId}`);
}

export async function refreshGameAccount(accountId: string): Promise<GameAccount> {
  const { data } = await apiClient.post<GameAccount>(`/game-accounts/${accountId}/refresh`);
  return data;
}

export async function getGameAccountStats(accountId: string): Promise<GameAccountStats> {
  const { data } = await apiClient.get<GameAccountStats>(`/game-accounts/${accountId}/stats`);
  return data;
}

export async function getMatchHistory(accountId: string): Promise<MatchHistoryEntry[]> {
  const { data } = await apiClient.get<MatchHistoryEntry[]>(`/game-accounts/${accountId}/match-history`);
  return data;
}

export async function syncMatchHistory(accountId: string): Promise<void> {
  await apiClient.post(`/game-accounts/${accountId}/match-history/sync`);
}

export async function getChampionStats(accountId: string): Promise<ChampionStat[]> {
  const { data } = await apiClient.get<ChampionStat[]>(`/game-accounts/${accountId}/champion-stats`);
  return data;
}

export async function getChampionMasteries(accountId: string): Promise<ChampionMastery[]> {
  const { data } = await apiClient.get<ChampionMastery[]>(`/game-accounts/${accountId}/champion-masteries`);
  return data;
}
