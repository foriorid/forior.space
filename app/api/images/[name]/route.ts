import { NextResponse } from "next/server";
import { readImage } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const img = await readImage(name);
  if (!img) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(img.buffer), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
