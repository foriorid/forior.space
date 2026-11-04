import { nanoid } from "nanoid";
import type { Listing, Settings } from "./types";
import type { ListingFilter } from "./store-file";
import { getSupabaseAdmin, IMAGE_BUCKET } from "./supabase";
import { resolvePricing } from "./pricing";

/**
 * Supabase-backed data store (used when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * are set). Listings are stored one row per listing with the full object in a
 * `doc` jsonb column; photos go to a public Storage bucket. See
 * docs/supabase-schema.sql for the required tables/bucket.
 */

const TABLE = "listings";
const SETTINGS_TABLE = "settings";
const SETTINGS_ID = "singleton";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};

function applyFilters(items: Listing[], filter: ListingFilter): Listing[] {
  let out = items;
  if (filter.listingType) {
    const want = filter.listingType;
    out = out.filter((l) => {
      const p = resolvePricing(l);
      return want === "sewa" ? p.forRent : p.forSale;
    });
  }
  if (filter.propertyType) out = out.filter((l) => l.propertyType === filter.propertyType);
  if (filter.city) out = out.filter((l) => l.city.toLowerCase().includes(filter.city!.toLowerCase()));
  if (filter.q) {
    const q = filter.q.toLowerCase();
    out = out.filter((l) =>
      [l.title, l.description, l.address, l.city].join(" ").toLowerCase().includes(q),
    );
  }
  return out;
}

export async function getListings(filter: ListingFilter = {}): Promise<Listing[]> {
  try {
    const sb = getSupabaseAdmin();
    let query = sb.from(TABLE).select("doc").order("updated_at", { ascending: false });
    if (filter.status) query = query.eq("status", filter.status);
    const { data, error } = await query;
    if (error) throw error;
    const items = (data ?? []).map((r) => (r as { doc: Listing }).doc);
    return applyFilters(items, filter);
  } catch (err) {
    // Don't let a Supabase/config error crash public pages — show empty instead.
    console.error("[store-supabase] getListings failed:", err);
    return [];
  }
}

export async function getListing(id: string): Promise<Listing | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from(TABLE).select("doc").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? (data as { doc: Listing }).doc : null;
  } catch (err) {
    console.error("[store-supabase] getListing failed:", err);
    return null;
  }
}

export async function createListing(
  data: Omit<Listing, "id" | "createdAt" | "updatedAt">,
): Promise<Listing> {
  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const listing: Listing = { ...data, id: nanoid(10), createdAt: now, updatedAt: now };
  const { error } = await sb.from(TABLE).insert({
    id: listing.id,
    status: listing.status,
    updated_at: listing.updatedAt,
    doc: listing,
  });
  if (error) throw error;
  return listing;
}

export async function updateListing(
  id: string,
  patch: Partial<Omit<Listing, "id" | "createdAt">>,
): Promise<Listing | null> {
  const current = await getListing(id);
  if (!current) return null;
  const updated: Listing = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from(TABLE)
    .update({ status: updated.status, updated_at: updated.updatedAt, doc: updated })
    .eq("id", id);
  if (error) throw error;
  return updated;
}

export async function deleteListing(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ---- Settings ----

export function defaultSettings(): Settings {
  return {
    agentName: process.env.NEXT_PUBLIC_AGENT_NAME || "Forior Space",
    waNumber: process.env.NEXT_PUBLIC_WA_NUMBER || "6281379097488",
  };
}

export async function getSettings(): Promise<Settings> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from(SETTINGS_TABLE)
      .select("data")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (error) throw error;
    const stored = (data as { data: Partial<Settings> } | null)?.data ?? {};
    return { ...defaultSettings(), ...stored };
  } catch (err) {
    console.error("[store-supabase] getSettings failed:", err);
    return defaultSettings();
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from(SETTINGS_TABLE).upsert({ id: SETTINGS_ID, data: next });
  if (error) throw error;
  return next;
}

// ---- Image storage ----

export async function saveImage(
  buffer: Buffer,
  mime: string,
): Promise<{ id: string; url: string }> {
  const sb = getSupabaseAdmin();
  const ext = EXT_BY_MIME[mime] ?? "jpg";
  const id = `${nanoid(12)}.${ext}`;
  // Upload as a Blob so supabase-js uses the multipart path (reliable on Node).
  const blob = new Blob([new Uint8Array(buffer)], { type: mime });
  const { error } = await sb.storage
    .from(IMAGE_BUCKET)
    .upload(id, blob, { contentType: mime, upsert: false });
  if (error) {
    console.error("[store-supabase] saveImage upload failed:", error);
    throw new Error(`Upload gagal: ${error.message}`);
  }
  const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(id);
  return { id, url: data.publicUrl };
}

/** In Supabase mode images are served via public Storage URLs, not /api/images. */
export async function readImage(
  _name: string,
): Promise<{ buffer: Buffer; mime: string } | null> {
  void _name;
  return null;
}
