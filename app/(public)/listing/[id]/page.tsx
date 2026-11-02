import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListing, getListings } from "@/lib/store";
import { isAuthed } from "@/lib/guard";
import { IS_STATIC } from "@/lib/asset";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import {
  IconArrowLeft,
  IconBed,
  IconBath,
  IconLand,
  IconRuler,
  IconCar,
  IconPin,
  IconWhatsApp,
  IconEdit,
} from "@/components/icons";
import { formatPrice, formatArea, locationLabel } from "@/lib/format";
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@/lib/types";
import { site, waLink } from "@/lib/site";

export const dynamic = "force-dynamic";

// Pre-render published listings when building the static GitHub Pages preview.
export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_STATIC !== "1") return [];
  const items = await getListings({ status: "published" });
  return items.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Properti tidak ditemukan" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: { images: listing.images[0] ? [listing.images[0].url] : [] },
  };
}

const CERT_LABELS: Record<string, string> = {
  SHM: "Sertifikat Hak Milik (SHM)",
  HGB: "Hak Guna Bangunan (HGB)",
  SHGB: "SHGB",
  Girik: "Girik",
  PPJB: "PPJB",
  Strata: "Strata Title",
  Lainnya: "Lainnya",
};

const FURNISH_LABELS: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi: "Semi Furnished",
  full: "Full Furnished",
};

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  const authed = IS_STATIC ? false : await isAuthed();

  if (!listing || (listing.status !== "published" && !authed)) notFound();

  const specs = [
    listing.bedrooms != null && { icon: IconBed, label: "Kamar Tidur", value: String(listing.bedrooms) },
    listing.bathrooms != null && { icon: IconBath, label: "Kamar Mandi", value: String(listing.bathrooms) },
    listing.landArea != null && { icon: IconLand, label: "Luas Tanah", value: formatArea(listing.landArea) },
    listing.buildingArea != null && { icon: IconRuler, label: "Luas Bangunan", value: formatArea(listing.buildingArea) },
    listing.floors != null && { icon: IconRuler, label: "Jumlah Lantai", value: String(listing.floors) },
    listing.carports != null && { icon: IconCar, label: "Carport", value: String(listing.carports) },
  ].filter(Boolean) as { icon: typeof IconBed; label: string; value: string }[];

  const waMessage = `Halo ${site.agentName}, saya tertarik dengan properti "${listing.title}" (${formatPrice(
    listing.price,
    listing.priceUnit,
  )}). Apakah masih tersedia?`;

  return (
    <div className="space-y-5">
      {/* Media */}
      <div className="relative overflow-hidden rounded-[28px]">
        <PhotoCarousel images={listing.images} title={listing.title} />
        <Link
          href="/"
          className="glass-strong absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full"
          aria-label="Kembali"
        >
          <IconArrowLeft width={20} height={20} />
        </Link>
        {authed && (
          <Link
            href={`/admin/edit/${listing.id}`}
            className="glass-strong absolute right-3 top-3 flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold"
          >
            <IconEdit width={16} height={16} /> Edit
          </Link>
        )}
      </div>

      {/* Header card */}
      <div className="glass rounded-[26px] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              listing.listingType === "sewa" ? "bg-foreground text-background" : "bg-accent text-accent-ink"
            }`}
          >
            {LISTING_TYPE_LABELS[listing.listingType]}
          </span>
          <span className="chip rounded-full px-2.5 py-1 text-[11px] font-medium">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
          {listing.status !== "published" && (
            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-bold text-amber-500">
              Draft
            </span>
          )}
        </div>
        <h1 className="mt-3 text-xl font-bold leading-snug">{listing.title}</h1>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[color:var(--muted)]">
          <IconPin width={16} height={16} />
          {locationLabel(listing) || "Lokasi belum diisi"}
        </p>
        <div className="mt-3 text-[26px] font-bold">
          {formatPrice(listing.price, listing.priceUnit)}
          {listing.negotiable && (
            <span className="ml-2 align-middle text-sm font-medium text-[color:var(--muted)]">(nego)</span>
          )}
        </div>
      </div>

      {/* Specs */}
      {specs.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {specs.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass flex items-center gap-3 rounded-2xl p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/18 text-[color:var(--foreground)]">
                  <Icon width={20} height={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">{s.value}</div>
                  <div className="text-xs text-[color:var(--muted)]">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legal / furnish */}
      {(listing.certificate || listing.furnished) && (
        <div className="flex flex-wrap gap-2">
          {listing.certificate && (
            <span className="chip rounded-xl px-3 py-1.5 text-sm">
              📄 {CERT_LABELS[listing.certificate] ?? listing.certificate}
            </span>
          )}
          {listing.furnished && (
            <span className="chip rounded-xl px-3 py-1.5 text-sm">
              🛋️ {FURNISH_LABELS[listing.furnished] ?? listing.furnished}
            </span>
          )}
        </div>
      )}

      {/* Agent row */}
      <div className="glass flex items-center gap-3 rounded-2xl p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#141d30] to-[#070b16] text-sm font-bold text-accent">
          {site.agentName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{site.agentName}</div>
          <div className="text-xs text-[color:var(--muted)]">Agen Properti</div>
        </div>
        <a
          href={waLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="btn-accent press flex h-11 w-11 items-center justify-center rounded-full"
        >
          <IconWhatsApp width={20} height={20} />
        </a>
      </div>

      {/* Description */}
      {listing.description && (
        <div>
          <h2 className="mb-2 text-base font-bold">Deskripsi</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--foreground)]/85">
            {listing.description}
          </p>
        </div>
      )}

      {/* Facilities */}
      {listing.facilities.length > 0 && (
        <div>
          <h2 className="mb-2 text-base font-bold">Fasilitas & Keunggulan</h2>
          <div className="flex flex-wrap gap-2">
            {listing.facilities.map((f, i) => (
              <span key={i} className="chip rounded-full px-3 py-1.5 text-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inline CTA */}
      <a
        href={waLink(waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-accent press flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold"
      >
        <IconWhatsApp width={22} height={22} />
        Hubungi {site.agentName}
      </a>
      <p className="text-center text-xs text-[color:var(--muted)]">
        Diposting oleh {site.agentName}
      </p>

      {/* Floating WA button */}
      <a
        href={waLink(waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi via WhatsApp"
        className="btn-accent press fixed bottom-28 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full"
      >
        <IconWhatsApp width={28} height={28} />
      </a>
    </div>
  );
}
