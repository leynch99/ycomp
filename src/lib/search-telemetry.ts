/**
 * Search telemetry — structured JSON to stdout.
 * No PII.
 */
export type SearchEventName =
  | "search_query"
  | "search_select"
  | "search_submit_all_results";

export function emitSearchEvent(
  name: SearchEventName,
  payload: Record<string, unknown> = {}
) {
  const entry = {
    "@timestamp": new Date().toISOString(),
    event: "search",
    name,
    ...payload,
  };
  console.info(JSON.stringify(entry));
}
