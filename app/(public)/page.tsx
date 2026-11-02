import Link from "next/link";
import { getListings } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { IconSearch } from "@/components/icons";
import { site } from "@/lib/site";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: { type: PropertyType; emoji: string }[] = [
  { type: "rumah", emoji: "🏡" },
  { type: "apartemen", emoji: "🏢" },
  { type: "ruko", emoji: "🏬" },
  { type: "tanah", emoji: "🌳" },
];

export default async function HomePage() {
  const listings = await getListings({ status: "published" });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="animate-fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#141d30] to-[#070b16] p-5 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet/30 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/70">Halo! 👋</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight">
            Temukan <span className="text-accent">ruang</span> terbaikmu
          </h1>
          <p className="mt-1.5 text-sm text-white/70">{site.tagline}</p>
          <Link
            href="/cari"
            className="press mt-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white/80 backdrop-blur-md"
          >
            <IconSearch width={18} height={18} />
            Cari lokasi, tipe, atau harga…
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="grid grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.type}
            href={`/cari?tipe=${cat.type}`}
            className="press glass flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center"
          >
            <span className="text-2xl" aria-hidden>{cat.emoji}</span>
            <span className="text-[11px] font-semibold">{PROPERTY_TYPE_LABELS[cat.type]}</span>
          </Link>
        ))}
      </section>

      {/* Listings */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Listing Terbaru</h2>
          <Link href="/cari" className="text-sm font-semibold text-[color:var(--muted)]">
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
    <div className="glass rounded-[26px] p-8 text-center">
      <p className="text-sm text-[color:var(--muted)]">
        Belum ada listing. Masuk ke menu <strong>Agen</strong> untuk menambahkan
        listing pertama lewat chat.
      </p>
      <Link
        href="/admin/new"
        className="btn-accent press mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-bold"
      >
        + Tambah Listing
      </Link>
    </div>
  );
}
