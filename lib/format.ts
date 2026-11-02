import type { Listing, PriceUnit } from "./types";

/** Trim a number to at most 2 decimals, Indonesian comma separator, no trailing zeros. */
function trimNum(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

/**
 * Format a Rupiah price into a short, human string.
 *  2_500_000_000 -> "Rp 2,5 M"
 *      850_000_000 -> "Rp 850 jt"
 *       15_000_000 (per_bulan) -> "Rp 15 jt/bln"
 */
export function formatPrice(
  price: number | null | undefined,
  unit: PriceUnit = "total",
): string {
  if (price == null || Number.isNaN(price)) return "Hubungi kami";

  let base: string;
  if (price >= 1_000_000_000) {
    base = `Rp ${trimNum(price / 1_000_000_000)} M`;
  } else if (price >= 1_000_000) {
    base = `Rp ${trimNum(price / 1_000_000)} jt`;
  } else {
    base = `Rp ${price.toLocaleString("id-ID")}`;
  }

  const suffix =
    unit === "per_bulan" ? "/bln" : unit === "per_tahun" ? "/thn" : "";
  return base + suffix;
}

export function formatArea(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "-";
  return `${n.toLocaleString("id-ID")} m²`;
}

/** A short location label for cards. */
export function locationLabel(listing: Pick<Listing, "address" | "city">): string {
  const parts = [listing.address, listing.city].filter(Boolean);
  return parts.join(", ");
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
