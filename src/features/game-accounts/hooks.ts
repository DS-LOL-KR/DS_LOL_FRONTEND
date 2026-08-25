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

export function useLinkGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LinkGameAccountRequest) => linkGameAccount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts'] }),
  });
}

export function useUnlinkGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => unlinkGameAccount(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts'] }),
  });
}

export function useRefreshGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: number) => refreshGameAccount(accountId),
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

export function useSyncMatchHistory(accountId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: SyncMatchHistoryRequest) => syncMatchHistory(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'match-history'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'champion-stats'] });
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
