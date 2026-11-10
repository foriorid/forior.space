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
import { BlurImage } from "@/components/BlurImage";
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
  const heroImg = listings.find((l) => l.images[0])?.images[0]?.url;

  return (
    <div className="space-y-6">
      {/* Hero — background image + dark-green overlay */}
      <section className="animate-fade-up relative flex min-h-[260px] items-end overflow-hidden rounded-[28px] p-6 shadow-lg sm:min-h-[360px] sm:p-10">
        {heroImg && (
          <BlurImage src={heroImg} alt="" eager className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06130c]/90 via-[#0b2317]/70 to-[#0b2317]/55" />
        <div className="relative w-full text-white">
          <p className="text-sm font-medium text-white/70">Halo! 👋</p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight sm:text-[40px]">
            Temukan{" "}
            <span className="relative inline-block">
              <span className="relative z-10">ruang</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded bg-accent/70" />
            </span>{" "}
            terbaikmu
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">{site.tagline}</p>
          <Link
            href="/cari"
            className="press mt-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-[#0d1220]/55 shadow-lg sm:max-w-xl"
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
