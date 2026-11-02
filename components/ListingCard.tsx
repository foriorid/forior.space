import Link from "next/link";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice, formatArea, locationLabel } from "@/lib/format";
import { withBase } from "@/lib/asset";
import { IconBed, IconBath, IconRuler, IconLand, IconPin } from "./icons";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images[0]?.url;
  const isSewa = listing.listingType === "sewa";

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line transition active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBase(cover)}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            Tanpa foto
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow ${
              isSewa ? "bg-emerald-600" : "bg-brand-600"
            }`}
          >
            {isSewa ? "Disewa" : "Dijual"}
          </span>
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <div className="text-lg font-bold text-brand-700 dark:text-brand-300">
          {formatPrice(listing.price, listing.priceUnit)}
          {listing.negotiable && (
            <span className="ml-1.5 align-middle text-xs font-medium text-[color:var(--muted)]">
              nego
            </span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-[color:var(--muted)]">
          <IconPin width={14} height={14} className="shrink-0" />
          <span className="line-clamp-1">{locationLabel(listing) || "Lokasi"}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 text-sm text-[color:var(--muted)]">
          {listing.bedrooms != null && (
            <Spec icon={<IconBed width={16} height={16} />} label={`${listing.bedrooms} KT`} />
          )}
          {listing.bathrooms != null && (
            <Spec icon={<IconBath width={16} height={16} />} label={`${listing.bathrooms} KM`} />
          )}
          {listing.landArea != null && (
            <Spec icon={<IconLand width={16} height={16} />} label={formatArea(listing.landArea)} />
          )}
          {listing.buildingArea != null && (
            <Spec icon={<IconRuler width={16} height={16} />} label={formatArea(listing.buildingArea)} />
          )}
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
}
