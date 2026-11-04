import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { NearbyPlace } from "./types";

/**
 * Looks up a building's facilities and nearby places from the web, so an agent
 * doesn't have to type them. Results are structured into the listing fields and
 * cached per building (see lib/store enrichment helpers) so repeats are free.
 */

const ENRICH_MODEL = process.env.ENRICH_MODEL || "claude-sonnet-5-5";

export interface EnrichmentData {
  facilities: string[];
  nearby: NearbyPlace[];
}

export interface EnrichResult {
  data: EnrichmentData;
  usedAi: boolean;
  error?: string;
}

const enrichSchema = z.object({
  facilities: z.array(z.string().catch("")).catch([]),
  nearby: z
    .array(
      z
        .object({
          category: z
            .enum([
              "swalayan", "rumah_sakit", "sekolah", "transportasi",
              "kuliner", "ibadah", "rekreasi", "lainnya",
            ])
            .catch("lainnya"),
          name: z.string().catch(""),
          time: z.string().catch(""),
        })
        .catch({ category: "lainnya", name: "", time: "" }),
    )
    .catch([]),
});

/** Stable cache key for a building (groups all listings in the same building). */
function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}
export function enrichKey(building: string, city: string): string {
  return `${slug(building)}|${slug(city || "")}`;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const ENRICH_TOOL = {
  name: "simpan_fasilitas",
  description:
    "Simpan fasilitas gedung dan daftar tempat terdekat yang ditemukan dari web.",
  input_schema: {
    type: "object" as const,
    properties: {
      facilities: {
        type: "array",
        items: { type: "string" },
        description:
          "Fasilitas di dalam gedung/apartemen (mis. Kolam renang, Gym, Mall, Keamanan 24 jam).",
      },
      nearby: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: [
                "swalayan", "rumah_sakit", "sekolah", "transportasi",
                "kuliner", "ibadah", "rekreasi", "lainnya",
              ],
            },
            name: { type: "string" },
            time: {
              type: "string",
              description: "Estimasi waktu/jarak jika ada, mis. '5 menit' atau '1 km'. Boleh kosong.",
            },
          },
          required: ["category", "name", "time"],
        },
      },
    },
    required: ["facilities", "nearby"],
  },
};

const SYSTEM = `Kamu asisten riset properti di Indonesia. Diberi nama gedung/apartemen dan kotanya, cari di web:
1) Fasilitas di dalam gedung/apartemen tersebut.
2) Tempat/akses penting di sekitarnya (mall/swalayan, rumah sakit, sekolah/kampus, transportasi seperti tol/MRT/stasiun, kuliner, tempat ibadah, rekreasi) beserta estimasi waktu/jarak bila tersedia.

Gunakan tool web_search untuk memverifikasi. JANGAN mengarang. Hanya masukkan yang kamu temukan dari sumber. Jika gedung tidak ditemukan/ragu, kembalikan daftar kosong.
Setelah riset, panggil tool simpan_fasilitas dengan datanya (bahasa Indonesia, ringkas).`;

export async function enrichPlace(
  building: string,
  city: string,
  hint = "",
): Promise<EnrichResult> {
  const empty: EnrichmentData = { facilities: [], nearby: [] };
  if (!hasApiKey()) return { data: empty, usedAi: false };
  if (!building.trim()) {
    return { data: empty, usedAi: false, error: "Nama gedung kosong" };
  }

  const client = new Anthropic();
  const tools = [
    { type: "web_search_20260209", name: "web_search", max_uses: 5 },
    ENRICH_TOOL,
  ];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Gedung/apartemen: "${building}"${city ? `, kota: ${city}` : ""}.${
        hint ? `\nKonteks tambahan: ${hint}` : ""
      }\n\nCari fasilitas gedung dan tempat terdekatnya, lalu panggil simpan_fasilitas.`,
    },
  ];

  try {
    // Server tools (web_search) can pause the turn; loop until the model emits
    // the simpan_fasilitas tool call (or we hit the iteration cap).
    for (let i = 0; i < 5; i++) {
      const response = await client.messages.create({
        model: ENRICH_MODEL,
        max_tokens: 2500,
        system: SYSTEM,
        tools: tools as unknown as Anthropic.Tool[],
        messages,
      } as Anthropic.MessageCreateParamsNonStreaming);

      const saveBlock = response.content.find(
        (b): b is Anthropic.ToolUseBlock =>
          b.type === "tool_use" && b.name === "simpan_fasilitas",
      );
      if (saveBlock) {
        const parsed = enrichSchema.parse(saveBlock.input);
        // Drop empty names.
        parsed.nearby = parsed.nearby.filter((n) => n.name.trim());
        parsed.facilities = parsed.facilities.filter((f) => f.trim());
        return { data: parsed, usedAi: true };
      }

      // Keep going only while the model is still working (server tool pause).
      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }
      // Model stopped without calling our tool — nothing found.
      return { data: empty, usedAi: true };
    }
    return { data: empty, usedAi: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[enrich] failed:", reason);
    return { data: empty, usedAi: false, error: reason };
  }
}
