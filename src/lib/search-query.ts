/**
 * Query normalization for search: trim, collapse spaces, lower-case.
 */
export function normalizeSearchQuery(q: string): string {
  return q
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
