// 로그인 후 원래 가려던 페이지로 돌려보내기.
// Google OAuth는 백엔드 리다이렉트라 콜백이 항상 정해진 곳(/groups 등)으로 떨어져요 —
// 로그인 페이지로 보내기 직전에 원래 주소를 이 탭의 sessionStorage에 적어두고, 로그인이
// 확인된 첫 화면에서 꺼내서 이동함. 디스코드 봇이 보내는 /discord/link?token=… 링크를
// 로그아웃 상태로 눌러도 로그인 후 그 페이지로 돌아오게 하려고 만듦(2026-09-29).
const KEY = 'returnTo';

// 같은 사이트 경로만 허용 — "//evil.com" 같은 프로토콜 상대 주소로 튕기는 걸 막음.
function isSafePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}

export function saveReturnTo(path: string): void {
  if (!isSafePath(path) || path === '/' || path.startsWith('/login')) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 로그인 자체는 되게 — 돌아오기만 안 될 뿐.
  }
}

export function consumeReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path && isSafePath(path) ? path : null;
  } catch {
    return null;
  }
}
