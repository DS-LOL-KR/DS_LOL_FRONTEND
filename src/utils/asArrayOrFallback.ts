// Without a live backend, unmatched API paths resolve to the dev server's
// index.html (a string), which passes `?.length` checks but has no array
// methods — guard with Array.isArray before falling back to mock data.
export function asArrayOrFallback<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}
