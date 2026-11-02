import { z } from "zod";

export const listingInputSchema = z.object({
  status: z.enum(["draft", "published"]).default("draft"),
  listingType: z.enum(["jual", "sewa"]).default("jual"),
  propertyType: z
    .enum([
      "rumah",
      "apartemen",
      "ruko",
      "tanah",
      "gudang",
      "kost",
      "villa",
      "lainnya",
    ])
    .default("rumah"),
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().default(""),
  price: z.number().nullable().default(null),
  priceUnit: z.enum(["total", "per_bulan", "per_tahun"]).default("total"),
  negotiable: z.boolean().default(false),
  bedrooms: z.number().int().nullable().default(null),
  bathrooms: z.number().int().nullable().default(null),
  landArea: z.number().nullable().default(null),
  buildingArea: z.number().nullable().default(null),
  floors: z.number().int().nullable().default(null),
  carports: z.number().int().nullable().default(null),
  certificate: z
    .enum(["SHM", "HGB", "SHGB", "Girik", "PPJB", "Strata", "Lainnya", ""])
    .default(""),
  furnished: z.enum(["unfurnished", "semi", "full", ""]).default(""),
  address: z.string().default(""),
  city: z.string().default(""),
  facilities: z.array(z.string()).default([]),
  images: z
    .array(z.object({ id: z.string(), url: z.string() }))
    .default([]),
  rawMessage: z.string().default(""),
});

export type ListingInput = z.infer<typeof listingInputSchema>;
