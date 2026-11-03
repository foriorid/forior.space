import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { requireAdmin, isAuthed } from "@/lib/guard";
import { getListings, createListing, type ListingFilter } from "@/lib/store";
import { listingInputSchema } from "@/lib/validate";
import type { ListingType, PropertyType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authed = await isAuthed();

  const filter: ListingFilter = {};
  const status = searchParams.get("status");
  // Public callers only ever see published listings.
  filter.status = authed && status ? (status as "draft" | "published") : "published";
  if (authed && status === "all") delete filter.status;

  const lt = searchParams.get("listingType");
  if (lt) filter.listingType = lt as ListingType;
  const pt = searchParams.get("propertyType");
  if (pt) filter.propertyType = pt as PropertyType;
  const city = searchParams.get("city");
  if (city) filter.city = city;
  const q = searchParams.get("q");
  if (q) filter.q = q;

  const listings = await getListings(filter);
  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const result = listingInputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", issues: result.error.flatten() },
      { status: 400 },
    );
  }

  const listing = await createListing(result.data);
  revalidateTag("listings");
  revalidatePath("/");
  revalidatePath("/cari");
  return NextResponse.json({ listing }, { status: 201 });
}
