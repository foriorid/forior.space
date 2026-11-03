import { unstable_cache } from "next/cache";
import { hasSupabase } from "./supabase";
import * as fileStore from "./store-file";
import * as supabaseStore from "./store-supabase";
import type { ListingFilter } from "./store-file";
import type { Listing, Settings } from "./types";

/**
 * Single data-access entry point for the whole app.
 *
 * - Picks Supabase when configured, else the local file store.
 * - Read functions are wrapped in the Next.js data cache (tags: "listings",
 *   "settings") so repeated page loads don't hit the database. Writes call
 *   revalidateTag(...) to refresh instantly (see the API routes).
 */

const impl = hasSupabase() ? supabaseStore : fileStore;

// Caching isn't available in the static export (GitHub Pages) build.
const CACHE = process.env.NEXT_PUBLIC_STATIC !== "1";

export type { ListingFilter } from "./store-file";

export function getListings(filter: ListingFilter = {}): Promise<Listing[]> {
  if (!CACHE) return impl.getListings(filter);
  return unstable_cache(
    () => impl.getListings(filter),
    ["getListings", JSON.stringify(filter)],
    { tags: ["listings"], revalidate: 300 },
  )();
}

export function getListing(id: string): Promise<Listing | null> {
  if (!CACHE) return impl.getListing(id);
  return unstable_cache(() => impl.getListing(id), ["getListing", id], {
    tags: ["listings", `listing:${id}`],
    revalidate: 300,
  })();
}

export function getSettings(): Promise<Settings> {
  if (!CACHE) return impl.getSettings();
  return unstable_cache(() => impl.getSettings(), ["getSettings"], {
    tags: ["settings"],
    revalidate: 600,
  })();
}

// Writes pass straight through (no caching).
export const createListing = impl.createListing;
export const updateListing = impl.updateListing;
export const deleteListing = impl.deleteListing;
export const updateSettings = impl.updateSettings;
export const defaultSettings = impl.defaultSettings;
export const saveImage = impl.saveImage;
export const readImage = impl.readImage;
