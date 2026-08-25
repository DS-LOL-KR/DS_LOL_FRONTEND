import { apiClient } from '../../api/client';
import type {
  ChampionMastery,
  ChampionStat,
  Game,
  GameAccount,
  GameAccountFullStats,
  GameAccountStats,
  LinkedGameAccount,
  LinkGameAccountRequest,
  MatchHistoryEntry,
  RiotPosition,
  SyncMatchHistoryRequest,
  SyncMatchHistoryResult,
} from './types';

export async function getGames(): Promise<Game[]> {
  const { data } = await apiClient.get<{ games: Game[] }>('/games');
  return data.games;
}

export async function getMyGameAccounts(): Promise<GameAccount[]> {
  const { data } = await apiClient.get<{ accounts: GameAccount[] }>('/users/me/game-accounts');
  return data.accounts;
}

export async function linkGameAccount(payload: LinkGameAccountRequest): Promise<LinkedGameAccount> {
  const { data } = await apiClient.post<{ account: LinkedGameAccount }>('/users/me/game-accounts', payload);
  return data.account;
}

export async function unlinkGameAccount(accountId: number): Promise<void> {
  await apiClient.delete(`/users/me/game-accounts/${accountId}`);
}

// Refreshes tier/summoner-level/mastery from Riot — returns only the updated
// stats row, not the full account.
export async function refreshGameAccount(accountId: number): Promise<GameAccountStats> {
  const { data } = await apiClient.post<{ stats: GameAccountStats }>(`/game-accounts/${accountId}/refresh`);
  return data.stats;
}

// Distinct from refresh: reads stored stats.stats + stats.positionStats without
// calling Riot again.
export async function getGameAccountFullStats(accountId: number): Promise<GameAccountFullStats> {
  const { data } = await apiClient.get<{ stats: GameAccountFullStats }>(`/game-accounts/${accountId}/stats`);
  return data.stats;
}

export async function getMatchHistory(
  accountId: number,
  limit = 20,
  position?: RiotPosition,
): Promise<MatchHistoryEntry[]> {
  const { data } = await apiClient.get<{ matches: MatchHistoryEntry[] }>(
    `/game-accounts/${accountId}/match-history`,
    { params: { limit, position } },
  );
  return data.matches;
}

export async function syncMatchHistory(
  accountId: number,
  payload?: SyncMatchHistoryRequest,
): Promise<SyncMatchHistoryResult> {
  const { data } = await apiClient.post<SyncMatchHistoryResult>(
    `/game-accounts/${accountId}/match-history/sync`,
    payload,
  );
  return data;
}

export async function getChampionStats(accountId: number): Promise<ChampionStat[]> {
  const { data } = await apiClient.get<{ championStats: ChampionStat[] }>(`/game-accounts/${accountId}/champion-stats`);
  return data.championStats;
}

// Sorted by masteryPoints desc; `limit` (default 10) caps how many come back.
export async function getChampionMasteries(accountId: number, limit = 10): Promise<ChampionMastery[]> {
  const { data } = await apiClient.get<{ masteries: ChampionMastery[] }>(
    `/game-accounts/${accountId}/champion-masteries`,
    { params: { limit } },
  );
  return data.masteries;
}
