import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { enrichPlace, enrichKey } from "@/lib/enrich";
import { getEnrichment, saveEnrichment } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const building = String(body.building || "").trim();
  const city = String(body.city || "").trim();
  const hint = String(body.hint || "").trim();
  const forceRefresh = Boolean(body.forceRefresh);

  if (!building) {
    return NextResponse.json(
      { error: "Nama gedung/apartemen wajib diisi" },
      { status: 400 },
    );
  }

  const key = enrichKey(building, city);

  // Cache-first: reuse a building we've already looked up (free, no web search).
  if (!forceRefresh) {
    const cached = await getEnrichment(key);
    if (cached && (cached.facilities?.length || cached.nearby?.length)) {
      return NextResponse.json({
        facilities: cached.facilities ?? [],
        nearby: cached.nearby ?? [],
        cached: true,
        usedAi: true,
        aiError: null,
      });
    }
  }

  const result = await enrichPlace(building, city, hint);

  // Save only successful, non-empty lookups so the cache stays useful.
  if (result.usedAi && (result.data.facilities.length || result.data.nearby.length)) {
    await saveEnrichment(key, building, city, result.data);
  }

  return NextResponse.json({
    facilities: result.data.facilities,
    nearby: result.data.nearby,
    cached: false,
    usedAi: result.usedAi,
    aiError: result.error ?? null,
  });
}
