import { format } from 'date-fns';

// API timestamps are UTC ISO strings — slicing them ("2026-09-24T12:32") shows
// UTC wall-clock time, 9 hours off for KST users. Format in the viewer's zone.
export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd HH:mm');
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd');
}
