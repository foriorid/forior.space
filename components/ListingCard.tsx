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

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isSewa ? "bg-foreground text-background" : "bg-accent text-accent-ink"
            }`}
          >
            {isSewa ? "Disewa" : "Dijual"}
          </span>
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
        </div>

        {/* Price glass pill */}
        <div className="absolute bottom-2.5 left-2.5 rounded-full bg-black/45 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-md">
          {formatPrice(listing.price, listing.priceUnit)}
          {listing.negotiable && <span className="ml-1 text-[11px] font-medium opacity-80">nego</span>}
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
