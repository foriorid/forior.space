"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Listing, ListingImage, ParsedListing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { resolvePricing, legacyPricing } from "@/lib/pricing";
import { serializeNearby, parseNearby } from "@/lib/nearby";
import { compressImage } from "@/lib/image";
import { ListingCard } from "./ListingCard";
import { IconSparkles, IconUpload, IconTrash, IconArrowLeft } from "./icons";

interface FormState {
  propertyType: ParsedListing["propertyType"];
  title: string;
  description: string;
  forSale: boolean;
  forRent: boolean;
  salePrice: number | null;
  rentPrice: number | null;
  rentUnit: "per_bulan" | "per_tahun";
  negotiable: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  landArea: number | null;
  buildingArea: number | null;
  floors: number | null;
  carports: number | null;
  certificate: ParsedListing["certificate"];
  furnished: ParsedListing["furnished"];
  address: string;
  city: string;
  facilities: string[];
}

function emptyForm(): FormState {
  return {
    propertyType: "rumah",
    title: "",
    description: "",
    forSale: true,
    forRent: false,
    salePrice: null,
    rentPrice: null,
    rentUnit: "per_bulan",
    negotiable: false,
    bedrooms: null,
    bathrooms: null,
    landArea: null,
    buildingArea: null,
    floors: null,
    carports: null,
    certificate: "",
    furnished: "",
    address: "",
    city: "",
    facilities: [],
  };
}

/** Map a stored listing or a freshly parsed result into editable form state. */
function toForm(src: Listing | ParsedListing): FormState {
  const p = resolvePricing(src);
  return {
    propertyType: src.propertyType,
    title: src.title ?? "",
    description: src.description ?? "",
    forSale: p.forSale,
    forRent: p.forRent,
    salePrice: p.salePrice,
    rentPrice: p.rentPrice,
    rentUnit: p.rentUnit,
    negotiable: src.negotiable ?? false,
    bedrooms: src.bedrooms ?? null,
    bathrooms: src.bathrooms ?? null,
    landArea: src.landArea ?? null,
    buildingArea: src.buildingArea ?? null,
    floors: src.floors ?? null,
    carports: src.carports ?? null,
    certificate: src.certificate ?? "",
    furnished: src.furnished ?? "",
    address: src.address ?? "",
    city: src.city ?? "",
    facilities: src.facilities ?? [],
  };
}

export function ListingEditor({ existing }: { existing?: Listing }) {
  const router = useRouter();
  const editing = Boolean(existing);

  const [message, setMessage] = useState(existing?.rawMessage ?? "");
  const [uploading, setUploading] = useState(false);
  const [usedAi, setUsedAi] = useState<boolean | null>(null);

  const [form, setForm] = useState<FormState>(
    existing ? toForm(existing) : emptyForm(),
  );
  const [images, setImages] = useState<ListingImage[]>(existing?.images ?? []);
  const [facilitiesText, setFacilitiesText] = useState(
    (existing?.facilities ?? []).join(", "),
  );
  const [amenitiesText, setAmenitiesText] = useState(
    (existing?.amenities ?? []).join(", "),
  );
  const [nearbyText, setNearbyText] = useState(
    serializeNearby(existing?.nearby),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reprocessing, setReprocessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [buildingName, setBuildingName] = useState(
    existing?.building || existing?.title || "",
  );
  const [enriching, setEnriching] = useState(false);
  const [enrichNote, setEnrichNote] = useState<string | null>(null);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  const addFileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function uploadFiles(files: File[]): Promise<ListingImage[]> {
    if (files.length === 0) return [];
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      const blob = await compressImage(files[i]);
      fd.append("files", blob, `foto-${i + 1}.jpg`);
    }
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal upload foto");
    }
    const data = await res.json();
    return data.images as ListingImage[];
  }

  // Run the AI on the chat text (+ uploaded photos) — first run and re-runs alike.
  // Works for any listing, including published ones: overwrites the structured
  // fields only, keeping the uploaded photos.
  async function rerunAi() {
    setError("");
    setAiError(null);
    if (!message.trim() && images.length === 0) {
      setError("Isi dulu teks chat properti untuk dirapikan AI.");
      return;
    }
    setReprocessing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, images }),
      });
      if (!res.ok) throw new Error("Gagal memproses");
      const data = await res.json();
      const parsed = data.parsed as ParsedListing;
      setForm(toForm(parsed));
      setFacilitiesText((parsed.facilities ?? []).join(", "));
      setAmenitiesText((parsed.amenities ?? []).join(", "));
      setNearbyText(serializeNearby(parsed.nearby));
      setUsedAi(Boolean(data.usedAi));
      setAiError(data.aiError ?? null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setReprocessing(false);
    }
  }

  // Look up facilities + nearby places for a building from the web (cached per
  // building so the same apartment is free the next time).
  async function enrichFromWeb(forceRefresh = false) {
    setEnrichError(null);
    setEnrichNote(null);
    const b = buildingName.trim();
    if (!b) {
      setEnrichError("Isi nama apartemen/gedung dulu.");
      return;
    }
    setEnriching(true);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building: b,
          city: form.city,
          hint: message.slice(0, 600),
          forceRefresh,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Gagal mencari");
      }
      const data = await res.json();
      if (data.aiError) {
        setEnrichError(data.aiError);
        return;
      }
      const amenNew: string[] = data.amenities || [];
      const nearNew: { category: string; name: string; time: string }[] =
        data.nearby || [];
      if (amenNew.length === 0 && nearNew.length === 0) {
        setEnrichNote(
          "Tidak ada data ditemukan. Coba nama gedung yang lebih spesifik atau lengkapi kotanya.",
        );
        return;
      }
      // Merge amenities / Fasilitas Properti (unique, case-insensitive).
      const existingAmen = amenitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const mergedAmen = [...existingAmen];
      for (const f of amenNew) {
        if (f.trim() && !mergedAmen.some((x) => x.toLowerCase() === f.toLowerCase())) {
          mergedAmen.push(f.trim());
        }
      }
      setAmenitiesText(mergedAmen.join(", "));
      // Merge nearby (dedupe by name).
      const existingNear = parseNearby(nearbyText);
      const merged = [...existingNear];
      for (const n of nearNew) {
        if (n.name?.trim() && !merged.some((x) => x.name.toLowerCase() === n.name.toLowerCase())) {
          merged.push(n as (typeof merged)[number]);
        }
      }
      setNearbyText(serializeNearby(merged));
      setEnrichNote(
        data.cached
          ? "✓ Diambil dari data tersimpan (tanpa biaya pencarian)."
          : "✓ Hasil pencarian web. Periksa & sunting bila perlu sebelum publish.",
      );
    } catch (err) {
      setEnrichError(err instanceof Error ? err.message : "Gagal mencari");
    } finally {
      setEnriching(false);
    }
  }

  async function addMorePhotos(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(files);
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function save(status: "draft" | "published") {
    setError("");
    if (!form.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const pricing = resolvePricing(form);
      const legacy = legacyPricing(pricing);
      const payload = {
        ...form,
        forSale: pricing.forSale,
        forRent: pricing.forRent,
        salePrice: pricing.forSale ? pricing.salePrice : null,
        rentPrice: pricing.forRent ? pricing.rentPrice : null,
        rentUnit: pricing.rentUnit,
        ...legacy, // listingType, price, priceUnit kept in sync for compatibility
        facilities: facilitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        amenities: amenitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        building: buildingName.trim(),
        nearby: parseNearby(nearbyText),
        images,
        rawMessage: message,
        status,
      };
      const res = await fetch(
        editing ? `/api/listings/${existing!.id}` : "/api/listings",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Gagal menyimpan");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setSaving(false);
    }
  }

  const pricing = resolvePricing(form);
  // Live preview reuses the public card; never navigated (pointer-events-none).
  const preview = {
    ...form,
    ...legacyPricing(pricing),
    id: existing?.id ?? "",
    status: existing?.status ?? "draft",
    images,
  } as unknown as Listing;
  const steps: [string, boolean][] = [
    ["Tulis gaya chat", true],
    ["Lengkapi detail", Boolean(form.title.trim())],
    ["Publish", existing?.status === "published"],
  ];
  const aiLabel = reprocessing
    ? "Memproses…"
    : editing || usedAi !== null
      ? "Rapikan ulang pakai AI"
      : "Proses dengan AI";

  return (
    <div className="space-y-5 pb-28 lg:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
          >
            <IconArrowLeft width={18} height={18} /> Kembali ke Dashboard
          </button>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {editing ? "Edit Listing" : "Tambah Listing"}
          </h1>
        </div>
        <ol className="flex items-center gap-2 text-xs font-bold">
          {steps.map(([label, on], i) => (
            <li
              key={label}
              className={`flex items-center gap-2 ${on ? "" : "text-[color:var(--muted)]"}`}
            >
              {i > 0 && <span className="h-0.5 w-5 rounded bg-line sm:w-8" />}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  on ? "bg-accent text-accent-ink" : "bg-black/[0.07]"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* LEFT — chat + form */}
        <div className="space-y-5">
          <section className="glass space-y-3 rounded-2xl p-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141d30] to-[#070b16] p-4 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative flex items-center gap-2 font-bold">
                <IconSparkles width={20} height={20} className="text-accent" /> Tulis seperti chat WA
              </div>
              <p className="relative mt-1 text-sm text-white/70">
                Ketik detail properti dengan bahasa bebas, AI merapikan jadi listing
                lengkap. Tambahkan foto juga.
              </p>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                "Contoh:\nRumah dijual Bintaro sektor 9, 3KT 2KM, LT 120 LB 90, SHM, 2.5M nego, carport 2 mobil, dekat tol & sekolah"
              }
              className={inputCls}
            />

            <input
              ref={addFileInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addMorePhotos(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => addFileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addMorePhotos(
                  Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")),
                );
              }}
              className="press flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface/50 py-4 text-sm font-semibold text-[color:var(--muted)]"
            >
              <IconUpload width={20} height={20} />
              {uploading
                ? "Mengunggah…"
                : images.length > 0
                  ? `${images.length} foto terunggah · tambah lagi`
                  : "Tarik foto ke sini atau klik untuk pilih"}
            </button>

            <div className="flex gap-2">
              <button
                onClick={rerunAi}
                disabled={reprocessing}
                className="btn-accent press flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:opacity-60"
              >
                <IconSparkles width={18} height={18} /> {aiLabel}
              </button>
              {!editing && (
                <a
                  href="#info"
                  className="press rounded-2xl border border-line bg-surface/60 px-4 py-3 text-sm font-semibold text-[color:var(--muted)]"
                >
                  Isi manual →
                </a>
              )}
            </div>
            <p className="text-xs text-[color:var(--muted)]">
              AI mengisi judul, deskripsi, spesifikasi &amp; tempat sekitar. Foto tidak berubah.
            </p>
          </section>

          {aiError ? (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200">
              <div className="font-bold">⚠️ AI gagal merapikan listing</div>
              <div className="mt-0.5">
                Memakai parser sederhana — judul/deskripsi/akses sekitar mungkin kurang rapi.
                Coba tekan “Rapikan ulang pakai AI” lagi, atau rapikan manual di bawah.
              </div>
              <div className="mt-1 break-words font-mono text-[10px] opacity-70">{aiError}</div>
            </div>
          ) : usedAi === false ? (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
              Diproses tanpa AI (parser sederhana). Mohon periksa &amp; lengkapi data di bawah.
            </div>
          ) : usedAi === true ? (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200">
              ✨ Berhasil dirapikan AI. Periksa &amp; edit bila perlu, lalu publish.
            </div>
          ) : null}

          <Section title="Info Utama" id="info">
            <Field label="Judul">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputCls}
                placeholder="Rumah Modern 2 Lantai di Bintaro"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tipe Properti">
                <select value={form.propertyType} onChange={(e) => set("propertyType", e.target.value as FormState["propertyType"])} className={inputCls}>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
              <div>
                <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">
                  Status pemasaran (boleh dua-duanya)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`press flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold ${form.forSale ? "border-accent bg-accent/15" : "border-line bg-surface/50 text-[color:var(--muted)]"}`}>
                    <input type="checkbox" checked={form.forSale} onChange={(e) => set("forSale", e.target.checked)} className="h-4 w-4 rounded accent-accent" />
                    Dijual
                  </label>
                  <label className={`press flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold ${form.forRent ? "border-accent bg-accent/15" : "border-line bg-surface/50 text-[color:var(--muted)]"}`}>
                    <input type="checkbox" checked={form.forRent} onChange={(e) => set("forRent", e.target.checked)} className="h-4 w-4 rounded accent-accent" />
                    Disewa
                  </label>
                </div>
              </div>
            </div>
            {!form.forSale && !form.forRent && (
              <p className="text-xs font-medium text-amber-600">Pilih minimal satu status.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {form.forSale && (
                <Field label="Harga Jual (Rupiah)" hint={form.salePrice != null ? formatPrice(form.salePrice, "total") : undefined}>
                  <input
                    inputMode="numeric"
                    value={form.salePrice != null ? form.salePrice.toLocaleString("id-ID") : ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      set("salePrice", digits ? parseInt(digits, 10) : null);
                    }}
                    className={inputCls}
                    placeholder="2.500.000.000"
                  />
                </Field>
              )}
              {form.forRent && (
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <Field label="Harga Sewa (Rupiah)" hint={form.rentPrice != null ? formatPrice(form.rentPrice, form.rentUnit) : undefined}>
                    <input
                      inputMode="numeric"
                      value={form.rentPrice != null ? form.rentPrice.toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        set("rentPrice", digits ? parseInt(digits, 10) : null);
                      }}
                      className={inputCls}
                      placeholder="50.000.000"
                    />
                  </Field>
                  <Field label="Per">
                    <select value={form.rentUnit} onChange={(e) => set("rentUnit", e.target.value as FormState["rentUnit"])} className={inputCls}>
                      <option value="per_bulan">Bulan</option>
                      <option value="per_tahun">Tahun</option>
                    </select>
                  </Field>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="h-5 w-5 rounded accent-accent" />
              Harga nego
            </label>
          </Section>

          <Section title="Spesifikasi">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumField label="Kamar Tidur" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
              <NumField label="Kamar Mandi" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} />
              <NumField label="Luas Tanah (m²)" value={form.landArea} onChange={(v) => set("landArea", v)} />
              <NumField label="Luas Bangunan (m²)" value={form.buildingArea} onChange={(v) => set("buildingArea", v)} />
              <NumField label="Jumlah Lantai" value={form.floors} onChange={(v) => set("floors", v)} />
              <NumField label="Carport" value={form.carports} onChange={(v) => set("carports", v)} />
              <Field label="Sertifikat">
                <select value={form.certificate} onChange={(e) => set("certificate", e.target.value as FormState["certificate"])} className={inputCls}>
                  <option value="">—</option>
                  {["SHM", "HGB", "SHGB", "Girik", "PPJB", "Strata", "Lainnya"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Perabot">
                <select value={form.furnished} onChange={(e) => set("furnished", e.target.value as FormState["furnished"])} className={inputCls}>
                  <option value="">—</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi">Semi Furnished</option>
                  <option value="full">Full Furnished</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Lokasi">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Area / Alamat">
                <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Bintaro Sektor 9" />
              </Field>
              <Field label="Kota / Kabupaten">
                <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="Tangerang Selatan" />
              </Field>
            </div>
          </Section>

          <Section title="Deskripsi & Keunggulan">
            <Field label="Deskripsi">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className={inputCls} />
            </Field>
            <Field
              label="Keunggulan Properti"
              hint="Ketik lalu Enter / koma — cth: Dekat Tol, Hadap Timur, Siap Huni"
            >
              <ChipInput value={facilitiesText} onChange={setFacilitiesText} placeholder="Dekat Tol, Hadap Timur, Bebas Banjir" />
            </Field>
            <Field
              label="Fasilitas Properti"
              hint="Fasilitas fisik gedung/apartemen — cth: Kolam Renang, Gym, Lift Pribadi"
            >
              <ChipInput value={amenitiesText} onChange={setAmenitiesText} placeholder="Kolam Renang, Gym, Keamanan 24 Jam" />
            </Field>
          </Section>

          <Section title="Lengkapi Otomatis dari Web">
            <Field
              label="Nama apartemen / gedung"
              hint="AI cari fasilitas & tempat sekitar dari web, lalu isi otomatis. Hasil disimpan per gedung — gedung yang sama berikutnya gratis."
            >
              <input
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                className={inputCls}
                placeholder="mis. Apartemen Taman Anggrek"
              />
            </Field>
            <div className="flex gap-2">
              <button
                onClick={() => enrichFromWeb(false)}
                disabled={enriching}
                className="btn-accent press flex-1 rounded-2xl py-3 text-sm font-bold disabled:opacity-60"
              >
                {enriching ? "Mencari…" : "🔎 Lengkapi otomatis"}
              </button>
              <button
                onClick={() => enrichFromWeb(true)}
                disabled={enriching}
                title="Cari ulang dari web (abaikan data tersimpan)"
                className="press rounded-2xl border border-line bg-surface/60 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                Cari ulang
              </button>
            </div>
            {enrichNote && <p className="text-xs font-medium text-emerald-600">{enrichNote}</p>}
            {enrichError && <p className="text-xs font-medium text-red-600">⚠️ {enrichError}</p>}
          </Section>

          <Section title="Lokasi & Tempat Sekitar">
            <Field
              label="Satu tempat per baris — format: Kategori | Nama | Waktu"
              hint="Kategori: Belanja, Rumah Sakit, Sekolah, Transportasi, Kuliner, Ibadah, Rekreasi, Lainnya"
            >
              <textarea
                value={nearbyText}
                onChange={(e) => setNearbyText(e.target.value)}
                rows={5}
                className={inputCls}
                placeholder={"Belanja | Superindo | 5 menit\nRumah Sakit | RS Pondok Indah | 10 menit\nSekolah | SD Al Azhar | 7 menit\nTransportasi | Gerbang Tol JORR | 3 menit"}
              />
            </Field>
          </Section>
        </div>

        {/* RIGHT — photos, live preview, actions (sticky on desktop) */}
        <div className="no-scrollbar space-y-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
          <Section title={`Foto (${images.length})`}>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    aria-label="Hapus foto"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <IconTrash width={11} height={11} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addFileInput.current?.click()}
                aria-label="Tambah foto"
                className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-line text-[color:var(--muted)]"
              >
                <IconUpload width={20} height={20} />
              </button>
            </div>
          </Section>

          <Section title="Pratinjau">
            <div className="pointer-events-none">
              <ListingCard listing={preview} prefetch={false} />
            </div>
            <p className="text-center text-xs text-[color:var(--muted)]">
              Beginilah listing tampil di halaman publik.
            </p>
          </Section>

          {/* Actions: fixed bar on mobile, pinned card on desktop */}
          <div className="glass-strong z-40 space-y-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))] max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 lg:sticky lg:bottom-0 lg:rounded-2xl">
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button
              onClick={rerunAi}
              disabled={reprocessing}
              className="btn-accent press hidden w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:opacity-60 lg:flex"
            >
              <IconSparkles width={18} height={18} /> {aiLabel}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => save("draft")}
                disabled={saving}
                className="press flex-1 rounded-full border border-line bg-surface/60 py-3 text-sm font-bold disabled:opacity-60"
              >
                Simpan Draft
              </button>
              <button
                onClick={() => save("published")}
                disabled={saving}
                className="btn-accent press flex-[1.5] rounded-full py-3 text-sm font-bold disabled:opacity-60"
              >
                {saving ? "Menyimpan…" : editing ? "Simpan & Publish" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="glass scroll-mt-4 space-y-3 rounded-2xl p-4">
      <h2 className="text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-medium text-[color:var(--foreground)]/70">{hint}</span>}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <Field label={label}>
      <input
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits ? parseInt(digits, 10) : null);
        }}
        className={inputCls}
      />
    </Field>
  );
}

/** Chip editor over the existing comma-separated string state. */
function ChipInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const chips = value.split(",").map((s) => s.trim()).filter(Boolean);
  const commit = () => {
    const t = draft.trim();
    if (t) onChange([...chips, t].join(", "));
    setDraft("");
  };
  return (
    <div className={`${inputCls} flex flex-wrap items-center gap-1.5`}>
      {/* input first in DOM so the wrapping <label> focuses it, not a chip's × */}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={chips.length ? "+ tambah" : placeholder}
        className="order-last min-w-[90px] flex-1 bg-transparent py-0.5 text-sm outline-none"
      />
      {chips.map((c, i) => (
        <span key={c + i} className="chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
          {c}
          <button
            type="button"
            aria-label={`Hapus ${c}`}
            onClick={() => onChange(chips.filter((_, idx) => idx !== i).join(", "))}
            className="text-[color:var(--muted)]"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
