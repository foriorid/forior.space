import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { getListings } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import {
  IconSearch,
  IconHome,
  IconBuilding,
  IconStore,
  IconLandscape,
} from "@/components/icons";
import { site } from "@/lib/site";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";

// Cached/edge-served; refreshed on write via revalidatePath("/").
export const revalidate = 60;

const CATEGORIES: { type: PropertyType; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { type: "rumah", Icon: IconHome },
  { type: "apartemen", Icon: IconBuilding },
  { type: "ruko", Icon: IconStore },
  { type: "tanah", Icon: IconLandscape },
];

export default async function HomePage() {
  const listings = await getListings({ status: "published" });

  return (
    <div className="space-y-6">
      {/* Hero — bright */}
      <section className="animate-fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e8f8c7] via-[#f3f8ea] to-[#e6edfb] p-5 shadow-lg ring-1 ring-black/5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-violet/25 blur-3xl" />
        <div className="relative text-[#0d1220]">
          <p className="text-sm font-medium text-[#0d1220]/60">Halo! 👋</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight">
            Temukan{" "}
            <span className="relative inline-block">
              <span className="relative z-10">ruang</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded bg-accent/70" />
            </span>{" "}
            terbaikmu
          </h1>
          <p className="mt-1.5 text-sm text-[#0d1220]/60">{site.tagline}</p>
          <Link
            href="/cari"
            className="press mt-4 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/85 px-4 py-3 text-sm font-medium text-[#0d1220]/55 shadow-sm backdrop-blur-md"
          >
            <IconSearch width={18} height={18} />
            Cari lokasi, tipe, atau harga…
          </Link>
        </div>
      </section>

      {/* Categories — minimalist icons */}
      <section className="grid grid-cols-4 gap-2.5">
        {CATEGORIES.map(({ type, Icon }) => (
          <Link
            key={type}
            href={`/cari?tipe=${type}`}
            className="press glass flex flex-col items-center gap-2 rounded-2xl p-3 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-[color:var(--foreground)]">
              <Icon width={20} height={20} />
            </span>
            <span className="text-[11px] font-semibold">{PROPERTY_TYPE_LABELS[type]}</span>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
