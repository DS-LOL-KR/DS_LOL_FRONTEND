// Vite/Date.now() based relative-time formatter — "n분 전" style, used wherever
// a "last updated" timestamp needs to read like a real value instead of a
// hardcoded placeholder string.
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return '갱신 기록 없음';

  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) return '방금 갱신';
  if (diffMinutes < 60) return `${diffMinutes}분 전 갱신`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전 갱신`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전 갱신`;
}
