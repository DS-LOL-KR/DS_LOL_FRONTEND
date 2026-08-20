export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface LoginRequest {
  googleIdToken: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
