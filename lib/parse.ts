import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ParsedListing } from "./types";

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
- title: judul singkat & menarik (maks ~70 karakter), contoh "Rumah Modern 2 Lantai di Bintaro Sektor 9"
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

  // miliar
  let m = lower.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(m|miliar|milyar)\b/);
  if (m) return { price: Math.round(parseFloat(m[1].replace(",", ".")) * 1_000_000_000), unit };
  // juta
  m = lower.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(jt|juta)\b/);
  if (m) return { price: Math.round(parseFloat(m[1].replace(",", ".")) * 1_000_000), unit };
  // ribu
  m = lower.match(/(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(rb|ribu)\b/);
  if (m) return { price: Math.round(parseFloat(m[1].replace(",", ".")) * 1_000), unit };
  // plain Rp with separators
  m = lower.match(/rp\s*([\d.,]{6,})/);
  if (m) {
    const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
    if (!Number.isNaN(n)) return { price: n, unit };
  }
  return { price: null, unit };
}

function num(re: RegExp, text: string): number | null {
  const m = text.match(re);
  return m ? parseInt(m[1], 10) : null;
}

export function fallbackParse(message: string): ParsedListing {
  const text = message.trim();
  const lower = text.toLowerCase();

  const listingType = /sewa|disewa|dikontrak|kontrakan|rent/.test(lower) ? "sewa" : "jual";

  let propertyType: ParsedListing["propertyType"] = "rumah";
  if (/apart|apartemen|condo|unit\s/.test(lower)) propertyType = "apartemen";
  else if (/ruko|rukan/.test(lower)) propertyType = "ruko";
  else if (/\btanah\b|kavling|kaveling/.test(lower)) propertyType = "tanah";
  else if (/gudang|warehouse/.test(lower)) propertyType = "gudang";
  else if (/kost|kos-kosan|kosan/.test(lower)) propertyType = "kost";
  else if (/villa|vila/.test(lower)) propertyType = "villa";

  const { price, unit } = parsePriceId(text);

  const bedrooms = num(/(\d+)\s*(?:kt|kamar tidur|bedroom|br)\b/i, lower);
  const bathrooms = num(/(\d+)\s*(?:km|kamar mandi|bathroom|ba)\b/i, lower);
  const landArea = num(/(?:lt|luas tanah)\s*[:=]?\s*(\d+)/i, lower);
  const buildingArea = num(/(?:lb|luas bangunan)\s*[:=]?\s*(\d+)/i, lower);
  const floors = num(/(\d+)\s*(?:lantai|lt\b|tingkat)/i, lower);
  const carports = num(/(?:carport|garasi)\s*(\d+)|(\d+)\s*(?:mobil|carport)/i, lower);

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

  const title =
    text.split("\n")[0]?.slice(0, 70) ||
    `${propertyType} ${listingType === "jual" ? "dijual" : "disewa"}`;

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
