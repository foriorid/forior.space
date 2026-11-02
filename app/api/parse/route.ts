import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { parseMessage, hasApiKey, type ParseImage } from "@/lib/parse";
import { readImage } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const imageNames: string[] = Array.isArray(body.imageNames)
    ? body.imageNames
    : [];

  if (!message && imageNames.length === 0) {
    return NextResponse.json(
      { error: "Pesan atau foto wajib diisi" },
      { status: 400 },
    );
  }

  // Load uploaded images as base64 for vision (only when an API key is set).
  const images: ParseImage[] = [];
  if (hasApiKey()) {
    for (const name of imageNames.slice(0, 6)) {
      const img = await readImage(name);
      if (img) images.push({ base64: img.buffer.toString("base64"), mime: img.mime });
    }
  }

  const parsed = await parseMessage(message, images);
  return NextResponse.json({ parsed, usedAi: hasApiKey() });
}
