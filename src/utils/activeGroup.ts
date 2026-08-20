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

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveGroupId(): string | null {
  return useSyncExternalStore(subscribe, getActiveGroupId);
}
