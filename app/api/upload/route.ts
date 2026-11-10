import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/guard";
import { saveImage } from "@/lib/store";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12MB per upload (before compression)

/**
 * Shrink listing photos so they load fast on slow connections: auto-orient
 * (phone EXIF), cap the long edge at 1920px, re-encode to WebP. A 4–8MB phone
 * photo becomes ~150–400KB. Falls back to the original on any decode error
 * (e.g. an unsupported format) so an upload never hard-fails.
 */
async function optimize(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string }> {
  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    return { buffer: out, mime: "image/webp" };
  } catch {
    return { buffer, mime };
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
  }

  const saved = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File ${file.name} terlalu besar (maks 12MB)` },
        { status: 400 },
      );
    }
    const original = Buffer.from(await file.arrayBuffer());
    const { buffer, mime } = await optimize(original, file.type || "image/jpeg");
    saved.push(await saveImage(buffer, mime));
  }

  return NextResponse.json({ images: saved });
}
