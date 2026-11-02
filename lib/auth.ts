import crypto from "crypto";

/**
 * Minimal single-admin auth for the MVP.
 * - ADMIN_PASSWORD: the password you type to log in (default "admin123").
 * - APP_SECRET: used to sign the session cookie (change it in production).
 *
 * For a multi-user / production setup, swap this for Supabase Auth or similar.
 */

export const SESSION_COOKIE = "fp_session";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function appSecret(): string {
  return process.env.APP_SECRET || "future-pro-dev-secret";
}

/** Token stored in the cookie = HMAC(secret, password). Rotating the password invalidates old sessions. */
export function sessionToken(): string {
  return crypto
    .createHmac("sha256", appSecret())
    .update(adminPassword())
    .digest("hex");
}

export function checkPassword(input: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(adminPassword());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isValidToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
