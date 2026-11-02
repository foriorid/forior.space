// Core domain types for Future Pro property listings.

export type ListingType = "jual" | "sewa";

export type PropertyType =
  | "rumah"
  | "apartemen"
  | "ruko"
  | "tanah"
  | "gudang"
  | "kost"
  | "villa"
  | "lainnya";

export type PriceUnit = "total" | "per_bulan" | "per_tahun";

export type Certificate =
  | "SHM"
  | "HGB"
  | "SHGB"
  | "Girik"
  | "PPJB"
  | "Strata"
  | "Lainnya"
  | "";

export type Furnished = "unfurnished" | "semi" | "full" | "";

export type ListingStatus = "draft" | "published";

export interface ListingImage {
  id: string;
  url: string;
}

export interface Listing {
  id: string;
  status: ListingStatus;
  listingType: ListingType;
  propertyType: PropertyType;
  title: string;
  description: string;
  price: number | null; // in Rupiah
  priceUnit: PriceUnit;
  negotiable: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  landArea: number | null; // m2
  buildingArea: number | null; // m2
  floors: number | null;
  carports: number | null;
  certificate: Certificate;
  furnished: Furnished;
  address: string; // area / street detail
  city: string; // e.g. "Jakarta Selatan", "Tangerang Selatan"
  facilities: string[];
  images: ListingImage[];
  rawMessage: string; // original chat text, for reference
  createdAt: string;
  updatedAt: string;
}

/** The fields the AI parser is expected to fill from a free-text message. */
export type ParsedListing = Pick<
  Listing,
  | "listingType"
  | "propertyType"
  | "title"
  | "description"
  | "price"
  | "priceUnit"
  | "negotiable"
  | "bedrooms"
  | "bathrooms"
  | "landArea"
  | "buildingArea"
  | "floors"
  | "carports"
  | "certificate"
  | "furnished"
  | "address"
  | "city"
  | "facilities"
>;

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  rumah: "Rumah",
  apartemen: "Apartemen",
  ruko: "Ruko",
  tanah: "Tanah",
  gudang: "Gudang",
  kost: "Kost",
  villa: "Villa",
  lainnya: "Lainnya",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  jual: "Dijual",
  sewa: "Disewa",
};

/** Editable site/agent settings (managed from the admin settings page). */
export interface Settings {
  agentName: string;
  /** WhatsApp number, stored in international digits, e.g. "6281379097488". */
  waNumber: string;
}
