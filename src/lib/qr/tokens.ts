import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";

/** Random opaque ticket token (sent to the guest; never stored raw). */
export function generateTicketToken(): string {
  return randomBytes(24).toString("base64url");
}

/** SHA-256 hash stored at rest; lookup key for tickets. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Six-digit one-time verification code for ticket recovery. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Payload embedded in the QR image. The scanner extracts the raw token. */
export function qrPayload(token: string): string {
  return `DELOUS26:${token}`;
}

export function parseQrPayload(payload: string): string | null {
  const trimmed = payload.trim();
  if (trimmed.startsWith("DELOUS26:")) return trimmed.slice("DELOUS26:".length);
  // Also tolerate a full invitation URL being scanned
  const match = trimmed.match(/\/invitation\/([A-Za-z0-9_-]{16,})/);
  if (match) return match[1];
  // Or a bare token
  if (/^[A-Za-z0-9_-]{16,}$/.test(trimmed)) return trimmed;
  return null;
}
