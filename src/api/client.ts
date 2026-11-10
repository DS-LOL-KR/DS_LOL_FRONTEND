import axios from 'axios';

// Auth is a Google OAuth redirect handled server-side (GET /auth/google →
// /auth/google/callback), which sets a session cookie — there is no client-held
// bearer token, so every request must carry that cookie.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Every endpoint's error responses share the `{ error: { message, details } }`
// envelope — unwrap it into a plain Error so `mutation.error?.message` is a
// real, user-facing string everywhere instead of an axios error dump.
// The HTTP status rides along on `.status` so callers can branch on it (e.g.
// 디스코드 연결: 400 만료 / 409 이미 연결됨) — read it with `getErrorStatus`.
export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  const status = (error as { response?: { status?: unknown } } | null)?.response?.status;
  return typeof status === 'number' ? status : undefined;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error?.message;
    return Promise.reject(message ? new ApiError(message, error?.response?.status) : error);
  },
);

// 개발 전용 목 API: .env.development.local에 VITE_MOCK=1 → 백엔드/로그인 없이 가짜 데이터로 화면 확인.
// import.meta.env.DEV가 false인 프로덕션 빌드에서는 이 분기와 목 파일이 통째로 빠진다.
if (import.meta.env.DEV && import.meta.env.VITE_MOCK === '1') {
  apiClient.defaults.adapter = async (config) => (await import('../mocks/mockAdapter')).mockAdapter(config);
}
