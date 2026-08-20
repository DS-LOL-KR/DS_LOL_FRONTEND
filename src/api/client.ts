import axios from 'axios';

// Auth is a Google OAuth redirect handled server-side (GET /auth/google →
// /auth/google/callback), which sets a session cookie — there is no client-held
// bearer token, so every request must carry that cookie.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
