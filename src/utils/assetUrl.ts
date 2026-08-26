// Backend returns upload paths as origin-relative (e.g. "/uploads/profile-images/x.jpg"),
// served from the API's own origin at "/uploads", not under the "/api" prefix.
// Resolving against window.location (or leaving it relative) would point at the
// frontend's own dev-server origin instead, so the image silently 404s.
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
