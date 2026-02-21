/**
 * Security telemetry: normalized identifiers, PII masking, structured event emission.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 255);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-9) || phone;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  const visible = Math.min(2, Math.floor(local.length / 2));
  return `${local.slice(0, visible)}***@${domain.slice(0, 2)}***`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

export type SecurityEventName =
  | "rate_limit_block"
  | "auth_attempt"
  | "auth_success"
  | "order_validation_failed"
  | "order_created";

export function emitSecurityEvent(
  name: SecurityEventName,
  payload: Record<string, unknown> = {}
) {
  const entry = {
    "@timestamp": new Date().toISOString(),
    event: "security",
    name,
    ...payload,
  };
  console.info(JSON.stringify(entry));
}
