import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional. When these env vars are set the app uses Supabase
 * (database + storage) for persistent data; otherwise it falls back to the
 * local file store (see lib/store.ts).
 *
 * - SUPABASE_URL                  : your project URL
 * - SUPABASE_SERVICE_ROLE_KEY     : service role key (server-side only, secret)
 */

export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Storage bucket that holds listing photos (create it as a PUBLIC bucket). */
export const IMAGE_BUCKET = process.env.SUPABASE_BUCKET || "listings";

export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

/** Server-side admin client (service role). Never expose this to the browser. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error("Supabase env vars are not configured");
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}
