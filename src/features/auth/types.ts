// GET /users/me is one resource shared by the auth session check and the
// profile-edit screen, so both features read this same shape.
export interface User {
  id: string;
  email: string;
  nickname: string;
  bio: string;
  avatarUrl: string | null;
}
