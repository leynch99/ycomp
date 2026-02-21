/**
 * Structured JSON logger for API observability.
 * Output format: { timestamp, level, requestId?, route?, status?, latencyMs?, message, ...rest }
 */

type LogLevel = "info" | "warn" | "error";

function formatLog(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {}
) {
  const entry = {
    "@timestamp": new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  return JSON.stringify(entry);
}

export function logApi(params: {
  requestId?: string;
  route: string;
  method: string;
  status: number;
  latencyMs: number;
  ip?: string;
}) {
  const msg =
    params.status >= 500 ? "api_error" : params.status >= 400 ? "api_client_error" : "api";
  const level: LogLevel = params.status >= 500 ? "error" : params.status >= 400 ? "warn" : "info";
  const line = formatLog(level, msg, params);
  if (params.status >= 500) {
    console.error(line);
  } else {
    console.info(line);
  }
}

export function logError(message: string, err: unknown, context?: Record<string, unknown>) {
  const fields: Record<string, unknown> = {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ...context,
  };
  console.error(formatLog("error", message, fields));
}

export function logExternalService(
  service: string,
  params: { success: boolean; latencyMs?: number; error?: string }
) {
  const level: LogLevel = params.success ? "info" : "warn";
  const line = formatLog(level, "external_service", {
    service,
    ...params,
  });
  console.info(line);
}
