import Link from "next/link";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatArea, locationLabel } from "@/lib/format";
import { resolvePricing, priceLines } from "@/lib/pricing";
import { withBase } from "@/lib/asset";
import { IconBed, IconBath, IconRuler, IconLand, IconPin } from "./icons";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images[0]?.url;
  const pricing = resolvePricing(listing);
  const lines = priceLines(pricing);
  const dual = lines.length > 1;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="press group block overflow-hidden rounded-[26px] glass"
    >
      <div className="relative m-1.5 aspect-[16/11] overflow-hidden rounded-[20px] bg-slate-300/40">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBase(cover)}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[color:var(--muted)]">
            Tanpa foto
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {pricing.forSale && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">
              Dijual
            </span>
          )}
          {pricing.forRent && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold text-background">
              Disewa
            </span>
          )}
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
        </div>

        {/* Price glass pill */}
        <div className="absolute bottom-2.5 left-2.5 rounded-2xl bg-black/45 px-3 py-1.5 text-white backdrop-blur-md">
          {dual ? (
            <div className="space-y-0.5">
              {lines.map((l) => (
                <div key={l.kind} className="flex items-baseline gap-1.5 text-xs font-bold leading-tight">
                  <span className="text-[9px] font-semibold uppercase opacity-70">{l.label}</span>
                  {l.value}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm font-bold">
              {lines[0]?.value}
              {listing.negotiable && (
                <span className="ml-1 text-[11px] font-medium opacity-80">nego</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-1.5">
        <h3 className="line-clamp-1 text-[15px] font-bold leading-snug">{listing.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-[color:var(--muted)]">
          <IconPin width={14} height={14} className="shrink-0" />
          <span className="line-clamp-1">{locationLabel(listing) || "Lokasi"}</span>
        </p>

        <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
          {listing.bedrooms != null && <Spec icon={<IconBed width={14} height={14} />} label={`${listing.bedrooms} KT`} />}
          {listing.bathrooms != null && <Spec icon={<IconBath width={14} height={14} />} label={`${listing.bathrooms} KM`} />}
          {listing.landArea != null && <Spec icon={<IconLand width={14} height={14} />} label={formatArea(listing.landArea)} />}
          {listing.buildingArea != null && <Spec icon={<IconRuler width={14} height={14} />} label={formatArea(listing.buildingArea)} />}
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="chip inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}
