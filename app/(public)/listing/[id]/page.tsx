import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListing, getListings, getSettings } from "@/lib/store";
import { isAuthed } from "@/lib/guard";
import { IS_STATIC } from "@/lib/asset";
import { PhotoGallery } from "@/components/PhotoGallery";
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
import { waLinkWith, toLocalPhone } from "@/lib/site";

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

  const settings = await getSettings();
  const agentName = settings.agentName;
  const phoneLocal = toLocalPhone(settings.waNumber);

  const specs = [
    listing.bedrooms != null && { icon: IconBed, label: "Kamar Tidur", value: String(listing.bedrooms) },
    listing.bathrooms != null && { icon: IconBath, label: "Kamar Mandi", value: String(listing.bathrooms) },
    listing.landArea != null && { icon: IconLand, label: "Luas Tanah", value: formatArea(listing.landArea) },
    listing.buildingArea != null && { icon: IconRuler, label: "Luas Bangunan", value: formatArea(listing.buildingArea) },
    listing.floors != null && { icon: IconRuler, label: "Jumlah Lantai", value: String(listing.floors) },
    listing.carports != null && { icon: IconCar, label: "Carport", value: String(listing.carports) },
  ].filter(Boolean) as { icon: typeof IconBed; label: string; value: string }[];

  const waMessage = `Halo ${agentName}, saya tertarik dengan properti "${listing.title}" (${formatPrice(
    listing.price,
    listing.priceUnit,
  )}). Apakah masih tersedia?`;
  const waHref = waLinkWith(settings.waNumber, waMessage);

  return (
    <div className="space-y-6">
      {/* Gallery */}
      <div className="relative">
        <PhotoGallery images={listing.images} title={listing.title} />
        <Link
          href="/"
          className="glass-strong absolute left-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full"
          aria-label="Kembali"
        >
          <IconArrowLeft width={20} height={20} />
        </Link>
        {authed && (
          <Link
            href={`/admin/edit/${listing.id}`}
            className="glass-strong absolute right-3 top-3 z-20 flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold"
          >
            <IconEdit width={16} height={16} /> Edit
          </Link>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        {/* Left: details */}
        <div className="space-y-5 lg:col-span-2">
          <div>
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
            <h1 className="mt-3 text-2xl font-bold leading-tight">{listing.title}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[color:var(--muted)]">
              <IconPin width={16} height={16} />
              {locationLabel(listing) || "Lokasi belum diisi"}
            </p>
            <div className="mt-3 text-[26px] font-bold lg:hidden">
              {formatPrice(listing.price, listing.priceUnit)}
              {listing.negotiable && (
                <span className="ml-2 align-middle text-sm font-medium text-[color:var(--muted)]">(nego)</span>
              )}
            </div>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {specs.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="glass flex items-center gap-3 rounded-2xl p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/18 text-[color:var(--foreground)]">
                      <Icon width={20} height={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{s.value}</div>
                      <div className="truncate text-xs text-[color:var(--muted)]">{s.label}</div>
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
        </div>

        {/* Right: sticky contact card */}
        <div className="mt-6 lg:col-span-1 lg:mt-0 lg:sticky lg:top-24">
          <div className="glass space-y-4 rounded-[26px] p-5">
            <div className="hidden lg:block">
              <div className="text-2xl font-bold">
                {formatPrice(listing.price, listing.priceUnit)}
              </div>
              {listing.negotiable && (
                <div className="text-xs font-medium text-[color:var(--muted)]">Harga nego</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#141d30] to-[#070b16] text-base font-bold text-accent">
                {agentName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{agentName}</div>
                <div className="text-xs text-[color:var(--muted)]">{phoneLocal}</div>
              </div>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent press flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold"
            >
              <IconWhatsApp width={22} height={22} />
              Hubungi via WhatsApp
            </a>
            <p className="text-center text-xs text-[color:var(--muted)]">
              Diposting oleh {agentName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
