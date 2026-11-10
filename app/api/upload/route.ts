import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { saveImage } from "@/lib/store";
import { optimizeImage } from "@/lib/image-server";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12MB per upload (before compression)

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
    const { buffer, mime } = await optimizeImage(original, file.type || "image/jpeg");
    saved.push(await saveImage(buffer, mime));
  }

  return NextResponse.json({ images: saved });
}
