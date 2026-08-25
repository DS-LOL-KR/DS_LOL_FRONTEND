// GET /users/me — verified against the real Notion API spec (page has actual
// request/response schemas, not just endpoint names).
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string;
  createdAt: string;
}
