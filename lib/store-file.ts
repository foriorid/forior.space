import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Listing, ListingStatus, ListingType, PropertyType, Settings } from "./types";
import { seedListings } from "./seed";

/**
 * File-based data store (default / MVP). Used when Supabase is not configured.
 * Data lives under ./data (listings.json, settings.json, uploads/).
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "listings.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Serialize writes so concurrent requests don't corrupt the JSON file.
let writeChain: Promise<unknown> = Promise.resolve();

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function readAll(): Promise<Listing[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as Listing[];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      const seeded = seedListings();
      await fs.writeFile(DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
      return seeded;
    }
    throw err;
  }
}

async function writeAll(listings: Listing[]): Promise<void> {
  await ensureDirs();
  const run = async () => {
    const tmp = DB_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(listings, null, 2), "utf8");
    await fs.rename(tmp, DB_FILE);
  };
  writeChain = writeChain.then(run, run);
  await writeChain;
}

export interface ListingFilter {
  status?: ListingStatus;
  listingType?: ListingType;
  propertyType?: PropertyType;
  city?: string;
  q?: string;
}

export async function getListings(filter: ListingFilter = {}): Promise<Listing[]> {
  let items = await readAll();

  if (filter.status) items = items.filter((l) => l.status === filter.status);
  if (filter.listingType) items = items.filter((l) => l.listingType === filter.listingType);
  if (filter.propertyType) items = items.filter((l) => l.propertyType === filter.propertyType);
  if (filter.city) items = items.filter((l) => l.city.toLowerCase().includes(filter.city!.toLowerCase()));
  if (filter.q) {
    const q = filter.q.toLowerCase();
    items = items.filter((l) =>
      [l.title, l.description, l.address, l.city].join(" ").toLowerCase().includes(q),
    );
  }

  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getListing(id: string): Promise<Listing | null> {
  const items = await readAll();
  return items.find((l) => l.id === id) ?? null;
}

export async function createListing(
  data: Omit<Listing, "id" | "createdAt" | "updatedAt">,
): Promise<Listing> {
  const items = await readAll();
  const now = new Date().toISOString();
  const listing: Listing = { ...data, id: nanoid(10), createdAt: now, updatedAt: now };
  items.push(listing);
  await writeAll(items);
  return listing;
}

export async function updateListing(
  id: string,
  patch: Partial<Omit<Listing, "id" | "createdAt">>,
): Promise<Listing | null> {
  const items = await readAll();
  const idx = items.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    ...patch,
    id: items[idx].id,
    createdAt: items[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(items);
  return items[idx];
}

export async function deleteListing(id: string): Promise<boolean> {
  const items = await readAll();
  const next = items.filter((l) => l.id !== id);
  if (next.length === items.length) return false;
  await writeAll(next);
  return true;
}

// ---- Settings ----

export function defaultSettings(): Settings {
  return {
    agentName: process.env.NEXT_PUBLIC_AGENT_NAME || "Forior Space",
    waNumber: process.env.NEXT_PUBLIC_WA_NUMBER || "6281379097488",
  };
}

export async function getSettings(): Promise<Settings> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    return { ...defaultSettings(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaultSettings();
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  await ensureDirs();
  const next = { ...(await getSettings()), ...patch };
  const tmp = SETTINGS_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, SETTINGS_FILE);
  return next;
}

// ---- Image storage ----

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};

export async function saveImage(buffer: Buffer, mime: string): Promise<{ id: string; url: string }> {
  await ensureDirs();
  const ext = EXT_BY_MIME[mime] ?? "jpg";
  const id = `${nanoid(12)}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, id), buffer);
  return { id, url: `/api/images/${id}` };
}

export async function readImage(name: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const safe = path.basename(name);
  const ext = safe.split(".").pop()?.toLowerCase() ?? "jpg";
  const mime =
    Object.entries(EXT_BY_MIME).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
  try {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return { buffer, mime };
  } catch {
    return null;
  }
}
