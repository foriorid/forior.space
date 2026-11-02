import { notFound } from "next/navigation";
import { getListing } from "@/lib/store";
import { ListingEditor } from "@/components/ListingEditor";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();
  return <ListingEditor existing={listing} />;
}
