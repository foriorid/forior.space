import Link from "next/link";
import { getListings } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { IconSearch } from "@/components/icons";
import { site } from "@/lib/site";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: PropertyType[] = ["rumah", "apartemen", "ruko", "tanah"];

export default async function HomePage() {
  const listings = await getListings({ status: "published" });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="animate-fade-up rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg">
        <p className="text-sm font-medium text-brand-100">Halo! 👋</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">
          Temukan properti impianmu
        </h1>
        <p className="mt-1 text-sm text-brand-100">{site.tagline}</p>
        <Link
          href="/cari"
          className="mt-4 flex items-center gap-2 rounded-xl bg-white/95 px-4 py-3 text-sm font-medium text-slate-500 shadow-sm"
        >
          <IconSearch width={18} height={18} />
          Cari lokasi, tipe, atau harga…
        </Link>
      </section>

      {/* Categories */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/cari?tipe=${cat}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-line transition active:scale-95"
            >
              <span className="text-2xl" aria-hidden>
                {cat === "rumah" ? "🏡" : cat === "apartemen" ? "🏢" : cat === "ruko" ? "🏬" : "🌳"}
              </span>
              <span className="text-xs font-medium">{PROPERTY_TYPE_LABELS[cat]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Listing Terbaru</h2>
          <Link href="/cari" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            Lihat semua
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
      <p className="text-sm text-[color:var(--muted)]">
        Belum ada listing. Masuk ke menu <strong>Agen</strong> untuk menambahkan
        listing pertama lewat chat.
      </p>
      <Link
        href="/admin/new"
        className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        + Tambah Listing
      </Link>
    </div>
  );
}
