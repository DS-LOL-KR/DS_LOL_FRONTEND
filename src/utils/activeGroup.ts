import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'activeGroupId';
const listeners = new Set<() => void>();

export function getActiveGroupId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveGroupId(groupId: string): void {
  if (getActiveGroupId() === groupId) return;
  localStorage.setItem(STORAGE_KEY, groupId);
  listeners.forEach((listener) => listener());
}

// Called on logout only (not on every /groups visit — see git history for why
// that was tried and reverted). Without this, a different account logging in
// on the same browser inherits the previous account's last-viewed group, and
// the nav's 내전/티어표 links point at a group they're not in.
export function clearActiveGroupId(): void {
  if (getActiveGroupId() === null) return;
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveGroupId(): string | null {
  return useSyncExternalStore(subscribe, getActiveGroupId);
}
