import { NextResponse } from "next/server";
import { requireAdmin, isAuthed } from "@/lib/guard";
import { getListing, updateListing, deleteListing } from "@/lib/store";
import { listingInputSchema } from "@/lib/validate";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  // Hide drafts from the public.
  if (listing.status !== "published" && !(await isAuthed())) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const result = listingInputSchema.partial().safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const listing = await updateListing(id, result.data);
  if (!listing) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const ok = await deleteListing(id);
  if (!ok) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
