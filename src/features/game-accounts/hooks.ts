import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getChampionMasteries,
  getChampionStats,
  getGameAccountFullStats,
  getGames,
  getMatchHistory,
  getMyGameAccounts,
  linkGameAccount,
  refreshGameAccount,
  syncMatchHistory,
  unlinkGameAccount,
} from './api';
import type { LinkGameAccountRequest, SyncMatchHistoryRequest } from './types';

export function useGames() {
  return useQuery({ queryKey: ['games'], queryFn: getGames });
}

export function useMyGameAccounts() {
  return useQuery({ queryKey: ['game-accounts'], queryFn: getMyGameAccounts });
}

// 연동 버튼만 눌러도 티어/전적까지 바로 채워지길 원하는 피드백으로, link 성공 직후
// 그 계정 id로 refresh+sync까지 이어서 실행함 (순서는 useFullSyncGameAccount와 동일한
// 이유로 refresh 먼저 — 라인별 MMR 계산이 그 시점의 internal_mmr을 기준선으로 씀).
export function useLinkAndSyncGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LinkGameAccountRequest) => {
      const account = await linkGameAccount(payload);
      await refreshGameAccount(account.id);
      await syncMatchHistory(account.id);
      return account;
    },
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', account.id, 'match-history'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', account.id, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', account.id, 'champion-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
}

export function useUnlinkGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => unlinkGameAccount(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts'] }),
  });
}

export function useGameAccountFullStats(accountId: number) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'stats'],
    queryFn: () => getGameAccountFullStats(accountId),
    enabled: Number.isFinite(accountId),
  });
}

export function useMatchHistory(accountId: number) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'match-history'],
    queryFn: () => getMatchHistory(accountId),
    enabled: Number.isFinite(accountId),
  });
}

// "지금 갱신"(라이엇 티어/레벨/숙련도 + internal_mmr), "전적 동기화"(매치 기록 +
// 라인별 MMR), 프로필의 "동기화" 버튼 — 이 셋이 따로 놀아서 하나만 눌러선 전체가
// 최신화되지 않는다는 피드백으로, 버튼 하나로 둘 다 순서대로(리프레시 먼저 —
// 라인별 MMR 계산이 그 시점의 internal_mmr을 기준선으로 쓰기 때문) 실행하도록 합침.
export function useFullSyncGameAccount(accountId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload?: SyncMatchHistoryRequest) => {
      await refreshGameAccount(accountId);
      return syncMatchHistory(accountId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'match-history'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'champion-stats'] });
      // internal_mmr/position_mmr이 바뀌면 그룹 티어표도 다시 계산돼야 함.
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
}

export function useChampionStats(accountId: number) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'champion-stats'],
    queryFn: () => getChampionStats(accountId),
    enabled: Number.isFinite(accountId),
  });
}

export function useChampionMasteries(accountId: number) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'champion-masteries'],
    queryFn: () => getChampionMasteries(accountId),
    enabled: Number.isFinite(accountId),
  });
}
