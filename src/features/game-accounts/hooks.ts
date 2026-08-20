import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getChampionMasteries,
  getChampionStats,
  getGameAccountStats,
  getGames,
  getMatchHistory,
  getMyGameAccounts,
  linkGameAccount,
  refreshGameAccount,
  syncMatchHistory,
  unlinkGameAccount,
} from './api';
import type { LinkGameAccountRequest } from './types';

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
    mutationFn: (accountId: string) => unlinkGameAccount(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts'] }),
  });
}

export function useRefreshGameAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => refreshGameAccount(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts'] }),
  });
}

export function useGameAccountStats(accountId: string) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'stats'],
    queryFn: () => getGameAccountStats(accountId),
    enabled: Boolean(accountId),
  });
}

export function useMatchHistory(accountId: string) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'match-history'],
    queryFn: () => getMatchHistory(accountId),
    enabled: Boolean(accountId),
  });
}

export function useSyncMatchHistory(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncMatchHistory(accountId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['game-accounts', accountId, 'match-history'] }),
  });
}

export function useChampionStats(accountId: string) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'champion-stats'],
    queryFn: () => getChampionStats(accountId),
    enabled: Boolean(accountId),
  });
}

export function useChampionMasteries(accountId: string) {
  return useQuery({
    queryKey: ['game-accounts', accountId, 'champion-masteries'],
    queryFn: () => getChampionMasteries(accountId),
    enabled: Boolean(accountId),
  });
}
