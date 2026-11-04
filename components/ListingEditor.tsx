"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Listing, ListingImage, ParsedListing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { resolvePricing, legacyPricing } from "@/lib/pricing";
import { serializeNearby, parseNearby } from "@/lib/nearby";
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

  const [phase, setPhase] = useState<"compose" | "form">(
    editing ? "form" : "compose",
  );
  const [message, setMessage] = useState(existing?.rawMessage ?? "");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [usedAi, setUsedAi] = useState<boolean | null>(null);

  const [form, setForm] = useState<FormState>(
    existing ? toForm(existing) : emptyForm(),
  );
  const [images, setImages] = useState<ListingImage[]>(existing?.images ?? []);
  const [facilitiesText, setFacilitiesText] = useState(
    (existing?.facilities ?? []).join(", "),
  );
  const [nearbyText, setNearbyText] = useState(
    serializeNearby(existing?.nearby),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reprocessing, setReprocessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
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

  // Compose → parse
  async function process() {
    setError("");
    if (!message.trim() && pendingFiles.length === 0) {
      setError("Tulis detail properti atau tambahkan foto dulu.");
      return;
    }
    setProcessing(true);
    try {
      const uploaded = await uploadFiles(pendingFiles);
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, images: uploaded }),
      });
      if (!res.ok) throw new Error("Gagal memproses pesan");
      const data = await res.json();
      const parsed = data.parsed as ParsedListing;
      setForm(toForm(parsed));
      setFacilitiesText((parsed.facilities ?? []).join(", "));
      setNearbyText(serializeNearby(parsed.nearby));
      setImages(uploaded);
      setUsedAi(Boolean(data.usedAi));
      setAiError(data.aiError ?? null);
      setPhase("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  }

  // Re-run the AI on the current chat text (+ photos). Works for any listing,
  // including ones already published — overwrites the structured fields only,
  // keeping the uploaded photos.
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
      setNearbyText(serializeNearby(parsed.nearby));
      setUsedAi(Boolean(data.usedAi));
      setAiError(data.aiError ?? null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setReprocessing(false);
    }
  }

  async function addMorePhotos(files: File[]) {
    try {
      const uploaded = await uploadFiles(files);
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
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

  // ---------- COMPOSE PHASE ----------
  if (phase === "compose") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
        >
          <IconArrowLeft width={18} height={18} /> Kembali
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141d30] to-[#070b16] p-4 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex items-center gap-2 font-bold">
            <IconSparkles width={20} height={20} className="text-accent" /> Tulis seperti chat WA
          </div>
          <p className="relative mt-1 text-sm text-white/70">
            Ketik detail properti dengan bahasa bebas, lalu AI akan merapikan
            jadi listing. Tambahkan foto juga ya.
          </p>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          placeholder={
            "Contoh:\nRumah dijual Bintaro sektor 9, 3KT 2KM, LT 120 LB 90, SHM, 2.5M nego, carport 2 mobil, dekat tol & sekolah"
          }
          className="glass w-full rounded-2xl p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-accent/30"
        />

        {/* Photo picker */}
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              setPendingFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
            }
          />
          <button
            onClick={() => fileInput.current?.click()}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface/50 py-4 text-sm font-semibold text-[color:var(--muted)]"
          >
            <IconUpload width={20} height={20} />
            {pendingFiles.length > 0
              ? `${pendingFiles.length} foto dipilih · tambah lagi`
              : "Tambah foto properti"}
          </button>
          {pendingFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {pendingFiles.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="space-y-2">
          <button
            onClick={process}
            disabled={processing}
            className="btn-accent press flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold disabled:opacity-60"
          >
            <IconSparkles width={20} height={20} />
            {processing ? "Memproses…" : "Proses dengan AI"}
          </button>
          <button
            onClick={() => setPhase("form")}
            className="w-full py-2 text-sm font-medium text-[color:var(--muted)]"
          >
            Lewati, isi manual →
          </button>
        </div>
      </div>
    );
  }

  // ---------- FORM PHASE ----------
  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-28">
      {!editing && (
        <button
          onClick={() => setPhase("compose")}
          className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
        >
          <IconArrowLeft width={18} height={18} /> Edit chat
        </button>
      )}

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
          Diproses tanpa AI (parser sederhana). Mohon periksa & lengkapi data di
          bawah.
        </div>
      ) : usedAi === true ? (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200">
          ✨ Berhasil dirapikan AI. Periksa & edit bila perlu, lalu publish.
        </div>
      ) : null}

      {/* AI re-run — works even for already-published listings */}
      <Section title="Rapikan dengan AI">
        <Field
          label="Teks chat properti (sumber AI)"
          hint="Edit teksnya bila perlu, lalu tekan tombol di bawah untuk merapikan ulang."
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={inputCls}
            placeholder={"Tempel/ubah detail properti gaya chat WA di sini…"}
          />
        </Field>
        <button
          onClick={rerunAi}
          disabled={reprocessing}
          className="btn-accent press flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:opacity-60"
        >
          <IconSparkles width={18} height={18} />
          {reprocessing ? "Merapikan…" : "✨ Rapikan ulang pakai AI"}
        </button>
        <p className="text-xs text-[color:var(--muted)]">
          Mengisi ulang judul, deskripsi, spesifikasi & “Fasilitas Akses Sekitar”.
          Foto tidak berubah.
        </p>
      </Section>

      {/* Photos */}
      <Section title="Foto">
        <div className="grid grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <IconTrash width={11} height={11} />
              </button>
            </div>
          ))}
          <input
            ref={addFileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addMorePhotos(Array.from(e.target.files ?? []))}
          />
          <button
            onClick={() => addFileInput.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-line text-[color:var(--muted)]"
          >
            <IconUpload width={20} height={20} />
          </button>
        </div>
      </Section>

      <Section title="Info Utama">
        <Field label="Judul">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls}
            placeholder="Rumah Modern 2 Lantai di Bintaro"
          />
        </Field>
        <Field label="Tipe Properti">
          <select value={form.propertyType} onChange={(e) => set("propertyType", e.target.value as FormState["propertyType"])} className={inputCls}>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
            Status pemasaran (bisa pilih dua-duanya)
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
          {!form.forSale && !form.forRent && (
            <p className="mt-1.5 text-xs font-medium text-amber-600">Pilih minimal satu status.</p>
          )}
        </div>

        {form.forSale && (
          <Field label="Harga Jual (Rupiah)" hint={form.salePrice != null ? formatPrice(form.salePrice, "total") : undefined}>
            <input
              inputMode="numeric"
              value={form.salePrice ?? ""}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                set("salePrice", digits ? parseInt(digits, 10) : null);
              }}
              className={inputCls}
              placeholder="2500000000"
            />
          </Field>
        )}

        {form.forRent && (
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Harga Sewa (Rupiah)" hint={form.rentPrice != null ? formatPrice(form.rentPrice, form.rentUnit) : undefined}>
              <input
                inputMode="numeric"
                value={form.rentPrice ?? ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  set("rentPrice", digits ? parseInt(digits, 10) : null);
                }}
                className={inputCls}
                placeholder="50000000"
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

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="h-5 w-5 rounded accent-accent" />
          Harga nego
        </label>
      </Section>

      <Section title="Spesifikasi">
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Kamar Tidur" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
          <NumField label="Kamar Mandi" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} />
          <NumField label="Luas Tanah (m²)" value={form.landArea} onChange={(v) => set("landArea", v)} />
          <NumField label="Luas Bangunan (m²)" value={form.buildingArea} onChange={(v) => set("buildingArea", v)} />
          <NumField label="Jumlah Lantai" value={form.floors} onChange={(v) => set("floors", v)} />
          <NumField label="Carport" value={form.carports} onChange={(v) => set("carports", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        <Field label="Area / Alamat">
          <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Bintaro Sektor 9" />
        </Field>
        <Field label="Kota / Kabupaten">
          <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="Tangerang Selatan" />
        </Field>
      </Section>

      <Section title="Deskripsi & Fasilitas">
        <Field label="Deskripsi">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="Fasilitas (pisahkan dengan koma)" hint="cth: Dekat tol, Carport 2 mobil, SHM">
          <input value={facilitiesText} onChange={(e) => setFacilitiesText(e.target.value)} className={inputCls} placeholder="Dekat tol, Carport, Security 24 jam" />
        </Field>
      </Section>

      <Section title="Fasilitas Akses Sekitar">
        <Field
          label="Satu tempat per baris — format: Kategori | Nama | Waktu"
          hint="Kategori: Swalayan, Rumah Sakit, Sekolah, Transportasi, Kuliner, Ibadah, Rekreasi, Lainnya"
        >
          <textarea
            value={nearbyText}
            onChange={(e) => setNearbyText(e.target.value)}
            rows={5}
            className={inputCls}
            placeholder={"Swalayan | Superindo | 5 menit\nRumah Sakit | RS Pondok Indah | 10 menit\nSekolah | SD Al Azhar | 7 menit\nTransportasi | Gerbang Tol JORR | 3 menit"}
          />
        </Field>
      </Section>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {/* Sticky save bar */}
      <div className="glass-strong fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
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
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass space-y-3 rounded-2xl p-4">
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

// ---- Client-side image compression ----
// Resizes photos to a sane size and re-encodes as JPEG before upload. Keeps
// requests small (well under Vercel's limit), speeds things up, and sidesteps
// iPhone HEIC issues. Falls back to the original file if anything fails.
type Drawable = ImageBitmap | HTMLImageElement;

async function decodeImage(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    } catch {
      /* fall back to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("decode failed"));
      im.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  try {
    const img = await decodeImage(file);
    const w0 = "naturalWidth" in img ? img.naturalWidth : img.width;
    const h0 = "naturalHeight" in img ? img.naturalHeight : img.height;
    const scale = Math.min(1, maxDim / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img as CanvasImageSource, 0, 0, w, h);
    if ("close" in img && typeof img.close === "function") img.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (!blob) throw new Error("toBlob returned null");
    return blob;
  } catch (err) {
    console.warn("[compressImage] using original file:", err);
    return file;
  }
}
