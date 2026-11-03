import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ParsedListing } from "./types";
import { PROPERTY_TYPE_LABELS } from "./types";

/** Title Case helper (EYD-friendly): capitalise each significant word. */
function titleCase(s: string): string {
  const small = new Set(["di", "dan", "yang", "untuk", "ke", "dari", "pada"]);
  return s
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w, i) =>
      i > 0 && small.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

/**
 * Turns a free-text, WhatsApp-style message (plus optional photos) into a
 * structured listing. Uses Claude when ANTHROPIC_API_KEY is set, and falls
 * back to a lightweight regex parser so the app still works without a key.
 */

export interface ParseImage {
  base64: string;
  mime: string;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

const parsedSchema = z.object({
  listingType: z.enum(["jual", "sewa"]).default("jual"),
  propertyType: z
    .enum([
      "rumah",
      "apartemen",
      "ruko",
      "tanah",
      "gudang",
      "kost",
      "villa",
      "lainnya",
    ])
    .default("rumah"),
  title: z.string().default(""),
  description: z.string().default(""),
  price: z.number().nullable().default(null),
  priceUnit: z.enum(["total", "per_bulan", "per_tahun"]).default("total"),
  negotiable: z.boolean().default(false),
  bedrooms: z.number().int().nullable().default(null),
  bathrooms: z.number().int().nullable().default(null),
  landArea: z.number().nullable().default(null),
  buildingArea: z.number().nullable().default(null),
  floors: z.number().int().nullable().default(null),
  carports: z.number().int().nullable().default(null),
  certificate: z
    .enum(["SHM", "HGB", "SHGB", "Girik", "PPJB", "Strata", "Lainnya", ""])
    .default(""),
  furnished: z.enum(["unfurnished", "semi", "full", ""]).default(""),
  address: z.string().default(""),
  city: z.string().default(""),
  facilities: z.array(z.string()).default([]),
});

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `Kamu adalah asisten agen properti di Indonesia (area Jakarta, Tangerang Selatan, dan sekitarnya).
Tugasmu: membaca pesan bebas dari agen (gaya chat WhatsApp) beserta foto (jika ada), lalu mengubahnya menjadi data listing properti yang terstruktur.

Keluarkan HANYA objek JSON valid (tanpa markdown, tanpa penjelasan) dengan field berikut:
- listingType: "jual" atau "sewa"
- propertyType: salah satu dari "rumah" | "apartemen" | "ruko" | "tanah" | "gudang" | "kost" | "villa" | "lainnya"
- title: judul listing yang rapi mengikuti pola:
    [Jenis Properti] + [Tipe] + [Unik Poin] + "di" [Lokasi] + [Hot Offering]
  Urutan Tipe & Unik Poin boleh ditukar agar natural. Contoh yang benar:
    "Apartemen 2 Bedroom Furnished di Antasari Place Murah"
    "Rumah Mewah 2 Lantai di Jati Padang Siap Huni"
  Aturan penulisan: pakai Title Case (huruf besar di awal tiap kata penting),
  ejaan baku/EYD, spasi rapi (satu spasi), JANGAN ALL CAPS, maksimal ~70 karakter.
  Hanya masukkan komponen yang memang diketahui dari pesan — jangan mengarang.
  Contoh Hot Offering: "Murah", "Nego", "Siap Huni", "Harga BU", "Dekat MRT".
- description: deskripsi rapi 2-4 kalimat, enak dibaca calon pembeli, rangkum poin penting dari pesan
- price: harga dalam Rupiah sebagai ANGKA bulat (contoh 2500000000 untuk 2,5 M, 15000000 untuk 15 juta). null jika tidak disebut
- priceUnit: "total" untuk harga jual/total, "per_bulan" atau "per_tahun" untuk sewa
- negotiable: true jika disebut nego/negotiable
- bedrooms: jumlah kamar tidur (angka) atau null
- bathrooms: jumlah kamar mandi (angka) atau null
- landArea: luas tanah dalam m2 (angka) atau null. "LT" = luas tanah
- buildingArea: luas bangunan dalam m2 (angka) atau null. "LB" = luas bangunan
- floors: jumlah lantai atau null
- carports: jumlah carport/garasi atau null
- certificate: "SHM" | "HGB" | "SHGB" | "Girik" | "PPJB" | "Strata" | "Lainnya" | "" (kosong jika tidak jelas)
- furnished: "unfurnished" | "semi" | "full" | "" (kosong jika tidak jelas)
- address: area/lokasi detail (contoh "Bintaro Sektor 9", "BSD City")
- city: kota/kabupaten (contoh "Jakarta Selatan", "Tangerang Selatan"). Tebak dari area jika perlu.
- facilities: array string fasilitas/keunggulan singkat (contoh ["Dekat tol", "Carport 2 mobil", "SHM"])

Aturan harga Indonesia: "M"/"miliar" = 1.000.000.000 ; "jt"/"juta" = 1.000.000 ; "rb"/"ribu" = 1.000.
Contoh: "2,5M" -> 2500000000 ; "850jt" -> 850000000 ; "15 juta/bulan" -> price 15000000, priceUnit "per_bulan".
Jika suatu data tidak ada di pesan, isi null / "" / [] sesuai tipe. Jangan mengarang data penting (harga, luas) yang tidak disebut.`;

export async function parseMessage(
  message: string,
  images: ParseImage[] = [],
): Promise<ParsedListing> {
  if (!hasApiKey()) {
    return fallbackParse(message);
  }

  const client = new Anthropic();

  const content: Anthropic.ContentBlockParam[] = [];
  for (const img of images.slice(0, 6)) {
    const mediaType = (
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(img.mime)
        ? img.mime
        : "image/jpeg"
    ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: img.base64 },
    });
  }
  content.push({
    type: "text",
    text: `Pesan dari agen:\n"""\n${message}\n"""\n\nKeluarkan JSON listing sekarang.`,
  });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: [{ role: "user", content }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const json = extractJson(text);
    const parsed = parsedSchema.parse(json);
    return normalize(parsed, message);
  } catch (err) {
    console.error("[parse] Claude parse failed, using fallback:", err);
    return fallbackParse(message);
  }
}

/** Pull the first JSON object out of a model response (handles code fences). */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(raw.slice(start, end + 1));
}

function normalize(p: ParsedListing, message: string): ParsedListing {
  if (!p.title) {
    p.title = message.split("\n")[0]?.slice(0, 70) || "Listing Properti";
  }
  if (!p.description) p.description = message.trim();
  // Sewa listings shouldn't keep "total" as unit if clearly monthly phrasing exists.
  return p;
}

// ---- Fallback regex parser ----------------------------------------------

const CITY_HINTS: Array<[RegExp, string]> = [
  [/bintaro|bsd|serpong|pamulang|ciputat|tangsel|tangerang selatan/i, "Tangerang Selatan"],
  [/jaksel|jakarta selatan|kebayoran|pondok indah|cilandak|gandaria|fatmawati|tebet/i, "Jakarta Selatan"],
  [/jakbar|jakarta barat|kebon jeruk|puri|kembangan/i, "Jakarta Barat"],
  [/jakpus|jakarta pusat|menteng|sudirman|thamrin/i, "Jakarta Pusat"],
  [/jaktim|jakarta timur|cakung|cibubur|rawamangun/i, "Jakarta Timur"],
  [/jakut|jakarta utara|kelapa gading|pluit|pantai indah kapuk|pik/i, "Jakarta Utara"],
  [/tangerang|gading serpong|alam sutera|karawaci/i, "Tangerang"],
  [/depok|margonda|cinere/i, "Depok"],
  [/bekasi|harapan indah|summarecon bekasi/i, "Bekasi"],
  [/bogor|sentul|cibinong/i, "Bogor"],
];

function parsePriceId(text: string): { price: number | null; unit: "total" | "per_bulan" | "per_tahun" } {
  const lower = text.toLowerCase();
  const unit: "total" | "per_bulan" | "per_tahun" = /per\s*bulan|\/bln|\/bulan|sebulan/.test(lower)
    ? "per_bulan"
    : /per\s*tahun|\/thn|\/tahun|setahun/.test(lower)
      ? "per_tahun"
      : "total";

  // For unit-suffixed amounts ("2.5 M", "1,39 M") the separator is a decimal.
  const toNum = (s: string) => parseFloat(s.replace(",", "."));

  // Search near the word "harga" first, then the whole text — avoids grabbing
  // random numbers like "72 m²" (land area) as the price.
  const scopes: string[] = [];
  const hIdx = lower.search(/harga/);
  if (hIdx >= 0) scopes.push(lower.slice(hIdx, hIdx + 40));
  scopes.push(lower);

  for (const s of scopes) {
    // miliar: "1,39 M", "2.5 miliar" — but NOT "72 m²" / "96m2" / "meter"
    let m = s.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(?:miliar|milyar|m(?![a-z²2]))/);
    if (m) return { price: Math.round(toNum(m[1]) * 1_000_000_000), unit };
    // juta
    m = s.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(?:juta|jt)(?![a-z])/);
    if (m) return { price: Math.round(toNum(m[1]) * 1_000_000), unit };
    // ribu
    m = s.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb)(?![a-z])/);
    if (m) return { price: Math.round(toNum(m[1]) * 1_000), unit };
    // plain Rp with separators, e.g. "Rp 1.390.000.000"
    m = s.match(/rp\s*([\d.]{6,})/);
    if (m) {
      const n = parseInt(m[1].replace(/[.]/g, ""), 10);
      if (!Number.isNaN(n)) return { price: n, unit };
    }
  }
  return { price: null, unit };
}

function num(re: RegExp, text: string): number | null {
  const m = text.match(re);
  return m ? parseInt(m[1], 10) : null;
}

const NUMPAT = "(\\d+(?:[.,]\\d+)?)";

/** Match a number BEFORE a label, e.g. "2 lantai". */
function numAfter(text: string, pattern: string): number | null {
  const m = text.match(new RegExp(pattern, "i"));
  return m ? Math.round(parseFloat(m[1].replace(",", "."))) : null;
}

/**
 * Extract a number tied to a label, in either order:
 *   "Kamar Tidur : 3", "KT: 3", "3 kamar tidur", "3KT"
 * asInt=false keeps decimals (for areas like 44.7).
 */
function extractNum(text: string, labelRe: string, asInt = true): number | null {
  const after = text.match(new RegExp(`(?:${labelRe})\\s*[:=\\-/]*\\s*${NUMPAT}`, "i"));
  const before = text.match(new RegExp(`${NUMPAT}\\s*(?:${labelRe})`, "i"));
  const raw = after?.[1] ?? before?.[1];
  if (raw == null) return null;
  const v = parseFloat(raw.replace(",", "."));
  if (Number.isNaN(v)) return null;
  return asInt ? Math.round(v) : v;
}

export function fallbackParse(message: string): ParsedListing {
  const text = message.trim();
  const lower = text.toLowerCase();

  const listingType = /sewa|disewa|dikontrak|kontrakan|rent/.test(lower) ? "sewa" : "jual";

  // Detect property type. "tanah" must NOT be triggered by the spec label
  // "luas tanah", and the opening line is the strongest signal.
  const detectType = (s: string): ParsedListing["propertyType"] | null => {
    if (/apartemen|\bapart\b|\bapt\b|condo/.test(s)) return "apartemen";
    if (/ruko|rukan/.test(s)) return "ruko";
    if (/gudang|warehouse/.test(s)) return "gudang";
    if (/\bvill?a\b|\bvila\b/.test(s)) return "villa";
    if (/\bkost?\b|kos-kosan|kosan/.test(s)) return "kost";
    if (/\brumah\b/.test(s)) return "rumah";
    if (/kavling|kaveling|tanah kosong|(?:jual|dijual|sewa|disewa)\s+tanah|sebidang tanah/.test(s))
      return "tanah";
    return null;
  };
  const head = lower.slice(0, 90); // opening usually states the type
  const bodyNoLuas = lower.replace(/luas\s+tanah/g, " ");
  const propertyType: ParsedListing["propertyType"] =
    detectType(head) ?? detectType(bodyNoLuas) ?? "rumah";

  const { price, unit } = parsePriceId(text);

  // Handles both "3 KT" and "Kamar Tidur : 3" / "Jumlah Kamar Tidur: 1 (satu)".
  const bedrooms = extractNum(lower, "kamar tidur|bed\\s?room|\\bkt\\b|\\bbr\\b");
  const bathrooms = extractNum(lower, "kamar mandi|bath\\s?room|\\bkm\\b");
  const landArea = extractNum(lower, "luas tanah|\\blt\\b", false);
  const buildingArea = extractNum(
    lower,
    "luas bangunan|luas unit|luas apartemen|luas apt|\\blb\\b",
    false,
  );
  const floors =
    extractNum(lower, "jumlah lantai", true) ??
    numAfter(lower, "(\\d+)\\s*(?:lantai|tingkat)");
  const carports = extractNum(lower, "carport|garasi|garage|mobil");

  let certificate: ParsedListing["certificate"] = "";
  if (/shm/i.test(text)) certificate = "SHM";
  else if (/shgb/i.test(text)) certificate = "SHGB";
  else if (/hgb/i.test(text)) certificate = "HGB";
  else if (/girik/i.test(text)) certificate = "Girik";
  else if (/ppjb/i.test(text)) certificate = "PPJB";
  else if (/strata/i.test(text)) certificate = "Strata";

  let furnished: ParsedListing["furnished"] = "";
  if (/full\s*furnish|fully furnished/i.test(lower)) furnished = "full";
  else if (/semi\s*furnish/i.test(lower)) furnished = "semi";
  else if (/unfurnish|kosongan|non furnish/i.test(lower)) furnished = "unfurnished";

  let city = "";
  for (const [re, name] of CITY_HINTS) {
    if (re.test(lower)) {
      city = name;
      break;
    }
  }

  const negotiable = /nego|negotiable|nett bisa kurang|bisa nego/i.test(lower);

  // Build a tidy title from known components (Title Case, EYD).
  const titleParts = [PROPERTY_TYPE_LABELS[propertyType]];
  if (floors) titleParts.push(`${floors} Lantai`);
  if (bedrooms) titleParts.push(`${bedrooms} Kamar`);
  if (furnished === "full") titleParts.push("Furnished");
  if (city) titleParts.push(`di ${city}`);
  if (negotiable) titleParts.push("Nego");
  const title = titleCase(titleParts.join(" ")).slice(0, 70);

  return {
    listingType,
    propertyType,
    title,
    description: text,
    price,
    priceUnit: unit,
    negotiable,
    bedrooms,
    bathrooms,
    landArea,
    buildingArea,
    floors,
    carports,
    certificate,
    furnished,
    address: "",
    city,
    facilities: [],
  };
}
