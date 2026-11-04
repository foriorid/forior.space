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
  // Accept full image objects ({id,url}) or legacy imageNames (ids only).
  const imageRefs: { id?: string; url?: string }[] = Array.isArray(body.images)
    ? body.images
    : Array.isArray(body.imageNames)
      ? body.imageNames.map((id: string) => ({ id }))
      : [];

  if (!message && imageRefs.length === 0) {
    return NextResponse.json(
      { error: "Pesan atau foto wajib diisi" },
      { status: 400 },
    );
  }

  // Build vision inputs: base64 in file mode (readImage works), public URL in
  // Supabase mode (readImage returns null, photos are served from storage).
  const images: ParseImage[] = [];
  if (hasApiKey()) {
    for (const ref of imageRefs.slice(0, 6)) {
      const local = ref.id ? await readImage(ref.id) : null;
      if (local) {
        images.push({ base64: local.buffer.toString("base64"), mime: local.mime });
      } else if (ref.url && /^https:\/\//.test(ref.url)) {
        images.push({ url: ref.url });
      }
    }
  }

  const result = await parseMessage(message, images);
  return NextResponse.json({
    parsed: result.parsed,
    usedAi: result.usedAi,
    aiError: result.error ?? null,
  });
}
