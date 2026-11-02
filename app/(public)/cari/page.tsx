import { getListings, type ListingFilter } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { FilterBar, type FilterValues } from "@/components/FilterBar";
import { CariStatic } from "@/components/CariStatic";
import { IS_STATIC } from "@/lib/asset";
import type { ListingType, PropertyType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Static GitHub Pages preview: no server, filter on the client instead.
  if (IS_STATIC) {
    const all = await getListings({ status: "published" });
    return <CariStatic listings={all} />;
  }

  const sp = await searchParams;

  const initial: FilterValues = {
    q: sp.q ?? "",
    jenis: (sp.jenis as FilterValues["jenis"]) ?? "",
    tipe: (sp.tipe as FilterValues["tipe"]) ?? "",
    kota: sp.kota ?? "",
  };

  const filter: ListingFilter = { status: "published" };
  if (initial.q) filter.q = initial.q;
  if (initial.jenis) filter.listingType = initial.jenis as ListingType;
  if (initial.tipe) filter.propertyType = initial.tipe as PropertyType;
  if (initial.kota) filter.city = initial.kota;

  const listings = await getListings(filter);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Cari Properti</h1>
      <FilterBar initial={initial} />

      <div>
        <p className="mb-3 text-sm text-[color:var(--muted)]">
          {listings.length} properti ditemukan
        </p>
        {listings.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center text-sm text-[color:var(--muted)] ring-1 ring-line">
            Tidak ada properti yang cocok. Coba ubah filter.
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
