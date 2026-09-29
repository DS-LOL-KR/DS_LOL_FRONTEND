// GET /users/me — verified against the real Notion API spec (page has actual
// request/response schemas, not just endpoint names).
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  // 디스코드 봇 연결 링크(/discord/link)로 연결한 디스코드 계정 ID — 없으면 null.
  // 연결 기능 이전 응답에는 필드 자체가 없을 수 있어 optional(2026-09-29).
  discordUserId?: string | null;
  createdAt: string;
}
