import type { NearbyCategory, NearbyPlace } from "./types";
import { NEARBY_CATEGORY_LABELS } from "./types";

const CATEGORY_ORDER: NearbyCategory[] = [
  "transportasi",
  "swalayan",
  "sekolah",
  "rumah_sakit",
  "kuliner",
  "ibadah",
  "rekreasi",
  "lainnya",
];

/** Guess a category from a free-text label (used by parser + editor import). */
export function guessCategory(text: string): NearbyCategory {
  const s = text.toLowerCase();
  if (/swalayan|supermarket|minimarket|mall|pasar|indomaret|alfamart|belanja|superindo|hypermart|carrefour|giant|lotte|transmart/.test(s))
    return "swalayan";
  if (/rumah sakit|\brs\b|klinik|puskesmas|apotek|kesehatan|medical|hospital/.test(s))
    return "rumah_sakit";
  if (/sekolah|sd\b|smp|sma|smk|kampus|universitas|univ|school|tk\b|paud|pendidikan|kuliah/.test(s))
    return "sekolah";
  if (/tol\b|gerbang tol|stasiun|mrt|lrt|krl|busway|transjakarta|halte|bandara|terminal|transportasi|exit tol|pintu tol/.test(s))
    return "transportasi";
  if (/resto|restoran|cafe|kafe|kuliner|warung|foodcourt|food court|makan/.test(s))
    return "kuliner";
  if (/masjid|gereja|pura|vihara|klenteng|musholla|mushola|ibadah/.test(s))
    return "ibadah";
  if (/taman|gym|kolam|golf|wisata|rekreasi|olahraga|sport|park|hotel/.test(s))
    return "rekreasi";
  return "lainnya";
}

/** Normalize a time string to end with "menit" when it's a bare number. */
export function normalizeTime(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^\d+$/.test(t)) return `${t} menit`;
  return t;
}

/**
 * Serialize nearby places to the editor textarea format, one per line:
 *   Kategori | Nama | 5 menit
 */
export function serializeNearby(items: NearbyPlace[] | undefined): string {
  if (!items || items.length === 0) return "";
  return items
    .map((n) => `${NEARBY_CATEGORY_LABELS[n.category] ?? "Lainnya"} | ${n.name} | ${n.time}`)
    .join("\n");
}

function labelToCategory(label: string): NearbyCategory {
  const want = label.trim().toLowerCase();
  for (const [key, l] of Object.entries(NEARBY_CATEGORY_LABELS)) {
    if (l.toLowerCase() === want) return key as NearbyCategory;
  }
  return guessCategory(label);
}

/**
 * Parse the editor textarea back into structured places. Each line may be:
 *   "Kategori | Nama | Waktu"  (preferred)
 *   "Nama | Waktu"             (category guessed from name)
 *   "Nama, 5 menit"            (fallback split)
 */
export function parseNearby(text: string): NearbyPlace[] {
  const out: NearbyPlace[] = [];
  for (const line of text.split("\n")) {
    const raw = line.trim();
    if (!raw) continue;
    const parts = raw.split("|").map((p) => p.trim());
    let category: NearbyCategory;
    let name: string;
    let time: string;
    if (parts.length >= 3) {
      category = labelToCategory(parts[0]);
      name = parts[1];
      time = parts.slice(2).join(" ");
    } else if (parts.length === 2) {
      name = parts[0];
      time = parts[1];
      category = guessCategory(name);
    } else {
      // Try "Nama, 5 menit" or "Nama - 5 menit"
      const m = raw.match(/^(.*?)[,\-–](\s*\d.*)$/);
      if (m) {
        name = m[1].trim();
        time = m[2].trim();
      } else {
        name = raw;
        time = "";
      }
      category = guessCategory(name);
    }
    if (!name) continue;
    out.push({ category, name, time: normalizeTime(time) });
  }
  return out;
}

/** Group places by category, preserving a sensible display order. */
export function groupNearby(
  items: NearbyPlace[] | undefined,
): { category: NearbyCategory; places: NearbyPlace[] }[] {
  if (!items || items.length === 0) return [];
  const map = new Map<NearbyCategory, NearbyPlace[]>();
  for (const it of items) {
    const arr = map.get(it.category) ?? [];
    arr.push(it);
    map.set(it.category, arr);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
    category,
    places: map.get(category)!,
  }));
}
