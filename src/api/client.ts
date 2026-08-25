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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error?.message;
    return Promise.reject(message ? new Error(message) : error);
  },
);
