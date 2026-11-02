import { hasSupabase } from "./supabase";
import * as fileStore from "./store-file";
import * as supabaseStore from "./store-supabase";

/**
 * Single data-access entry point for the whole app.
 *
 * Uses Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set,
 * otherwise falls back to the local file store. Nothing else in the app needs
 * to know which backend is active.
 */

const impl = hasSupabase() ? supabaseStore : fileStore;

export type { ListingFilter } from "./store-file";

export const getListings = impl.getListings;
export const getListing = impl.getListing;
export const createListing = impl.createListing;
export const updateListing = impl.updateListing;
export const deleteListing = impl.deleteListing;
export const getSettings = impl.getSettings;
export const updateSettings = impl.updateSettings;
export const defaultSettings = impl.defaultSettings;
export const saveImage = impl.saveImage;
export const readImage = impl.readImage;
