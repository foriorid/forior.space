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
  | "ruang_usaha"
  | "gedung"
  | "lainnya";

export type PriceUnit = "total" | "per_bulan" | "per_tahun";

/** Unit for a rent price (sale is always a total). */
export type RentUnit = "per_bulan" | "per_tahun";

/** Category of a nearby place, used to pick an icon on the detail page. */
export type NearbyCategory =
  | "swalayan"
  | "rumah_sakit"
  | "sekolah"
  | "transportasi"
  | "kuliner"
  | "ibadah"
  | "rekreasi"
  | "lainnya";

export interface NearbyPlace {
  category: NearbyCategory;
  name: string;
  /** Travel time text as shown, e.g. "5 menit". */
  time: string;
}

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
  listingType: ListingType; // legacy primary status (kept in sync for compatibility)
  propertyType: PropertyType;
  title: string;
  description: string;
  price: number | null; // in Rupiah — legacy primary price (kept in sync)
  priceUnit: PriceUnit;
  negotiable: boolean;
  // Dual marketing: a listing can be offered for sale AND for rent at once.
  forSale?: boolean;
  forRent?: boolean;
  salePrice?: number | null; // Rupiah (total)
  rentPrice?: number | null; // Rupiah
  rentUnit?: RentUnit;
  /** Nearby access/places, grouped & displayed on the detail page. */
  nearby?: NearbyPlace[];
  /** Physical building/apartment amenities (pool, gym, …) shown with icons. */
  amenities?: string[];
  /** Canonical building/apartment name, used to reuse enrichment per building. */
  building?: string;
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
  | "forSale"
  | "forRent"
  | "salePrice"
  | "rentPrice"
  | "rentUnit"
  | "nearby"
  | "amenities"
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
  ruang_usaha: "Ruang Usaha",
  gedung: "Gedung",
  lainnya: "Lainnya",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  jual: "Dijual",
  sewa: "Disewa",
};

export const NEARBY_CATEGORY_LABELS: Record<NearbyCategory, string> = {
  swalayan: "Belanja",
  rumah_sakit: "Rumah Sakit",
  sekolah: "Sekolah",
  transportasi: "Transportasi",
  kuliner: "Kuliner",
  ibadah: "Ibadah",
  rekreasi: "Rekreasi",
  lainnya: "Lainnya",
};

/** Editable site/agent settings (managed from the admin settings page). */
export interface Settings {
  agentName: string;
  /** WhatsApp number, stored in international digits, e.g. "6281379097488". */
  waNumber: string;
}
