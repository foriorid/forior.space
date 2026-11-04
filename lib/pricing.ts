import type { Listing, RentUnit } from "./types";
import { formatPrice } from "./format";

export interface ResolvedPricing {
  forSale: boolean;
  forRent: boolean;
  salePrice: number | null;
  rentPrice: number | null;
  rentUnit: RentUnit;
}

type PricingSource = Partial<
  Pick<
    Listing,
    | "listingType"
    | "price"
    | "priceUnit"
    | "forSale"
    | "forRent"
    | "salePrice"
    | "rentPrice"
    | "rentUnit"
  >
>;

/**
 * Resolve a listing's pricing into the dual sale/rent shape, transparently
 * upgrading legacy records (single `listingType` + `price`) so every consumer
 * can read one consistent structure.
 */
export function resolvePricing(l: PricingSource): ResolvedPricing {
  const hasDual = l.forSale != null || l.forRent != null;
  if (hasDual) {
    const forSale = Boolean(l.forSale);
    const forRent = Boolean(l.forRent);
    return {
      // Guard against both being false — fall back to "sale" so the listing
      // still shows a status.
      forSale: forSale || !forRent,
      forRent,
      salePrice: l.salePrice ?? null,
      rentPrice: l.rentPrice ?? null,
      rentUnit: l.rentUnit ?? "per_bulan",
    };
  }

  const isSewa = l.listingType === "sewa";
  const rentUnit: RentUnit = l.priceUnit === "per_tahun" ? "per_tahun" : "per_bulan";
  return {
    forSale: !isSewa,
    forRent: isSewa,
    salePrice: isSewa ? null : (l.price ?? null),
    rentPrice: isSewa ? (l.price ?? null) : null,
    rentUnit,
  };
}

/**
 * Collapse the dual model back onto the legacy primary fields so old readers
 * (metadata, filters) and stored docs stay valid. Sale is primary when present.
 */
export function legacyPricing(p: ResolvedPricing): {
  listingType: "jual" | "sewa";
  price: number | null;
  priceUnit: "total" | "per_bulan" | "per_tahun";
} {
  if (p.forSale) {
    return { listingType: "jual", price: p.salePrice, priceUnit: "total" };
  }
  return { listingType: "sewa", price: p.rentPrice, priceUnit: p.rentUnit };
}

export interface PriceLine {
  kind: "jual" | "sewa";
  label: string; // "Dijual" / "Disewa"
  value: string; // formatted price, e.g. "Rp 2,5 M"
}

/** Build the price line(s) to display for a listing. */
export function priceLines(p: ResolvedPricing): PriceLine[] {
  const lines: PriceLine[] = [];
  if (p.forSale) {
    lines.push({ kind: "jual", label: "Dijual", value: formatPrice(p.salePrice, "total") });
  }
  if (p.forRent) {
    lines.push({ kind: "sewa", label: "Disewa", value: formatPrice(p.rentPrice, p.rentUnit) });
  }
  return lines;
}
