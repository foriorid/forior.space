"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Listing, ListingImage, ParsedListing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { IconSparkles, IconUpload, IconTrash, IconArrowLeft } from "./icons";

interface FormState {
  listingType: "jual" | "sewa";
  propertyType: ParsedListing["propertyType"];
  title: string;
  description: string;
  price: number | null;
  priceUnit: "total" | "per_bulan" | "per_tahun";
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
    listingType: "jual",
    propertyType: "rumah",
    title: "",
    description: "",
    price: null,
    priceUnit: "total",
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

function fromListing(l: Listing): FormState {
  const { id, status, images, rawMessage, createdAt, updatedAt, ...rest } = l;
  void id; void status; void images; void rawMessage; void createdAt; void updatedAt;
  return rest;
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
    existing ? fromListing(existing) : emptyForm(),
  );
  const [images, setImages] = useState<ListingImage[]>(existing?.images ?? []);
  const [facilitiesText, setFacilitiesText] = useState(
    (existing?.facilities ?? []).join(", "),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const addFileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function uploadFiles(files: File[]): Promise<ListingImage[]> {
    if (files.length === 0) return [];
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Gagal upload foto");
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
        body: JSON.stringify({
          message,
          imageNames: uploaded.map((u) => u.id),
        }),
      });
      if (!res.ok) throw new Error("Gagal memproses pesan");
      const data = await res.json();
      const parsed = data.parsed as ParsedListing;
      setForm({ ...emptyForm(), ...parsed });
      setFacilitiesText((parsed.facilities ?? []).join(", "));
      setImages(uploaded);
      setUsedAi(Boolean(data.usedAi));
      setPhase("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessing(false);
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
      const payload = {
        ...form,
        facilities: facilitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
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
      <div className="space-y-4">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
        >
          <IconArrowLeft width={18} height={18} /> Kembali
        </button>

        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <div className="flex items-center gap-2 font-bold">
            <IconSparkles width={20} height={20} /> Tulis seperti chat WA
          </div>
          <p className="mt-1 text-sm text-brand-100">
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
          className="w-full rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface py-4 text-sm font-semibold text-[color:var(--muted)]"
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/25 active:scale-[0.99] disabled:opacity-60"
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
    <div className="space-y-5 pb-28">
      {!editing && (
        <button
          onClick={() => setPhase("compose")}
          className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
        >
          <IconArrowLeft width={18} height={18} /> Edit chat
        </button>
      )}

      {usedAi === false && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          Diproses tanpa AI (parser sederhana). Mohon periksa & lengkapi data di
          bawah.
        </div>
      )}
      {usedAi === true && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200">
          ✨ Berhasil dirapikan AI. Periksa & edit bila perlu, lalu publish.
        </div>
      )}

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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jenis">
            <select value={form.listingType} onChange={(e) => set("listingType", e.target.value as FormState["listingType"])} className={inputCls}>
              <option value="jual">Dijual</option>
              <option value="sewa">Disewa</option>
            </select>
          </Field>
          <Field label="Tipe Properti">
            <select value={form.propertyType} onChange={(e) => set("propertyType", e.target.value as FormState["propertyType"])} className={inputCls}>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Harga (Rupiah)" hint={form.price != null ? formatPrice(form.price, form.priceUnit) : undefined}>
          <input
            inputMode="numeric"
            value={form.price ?? ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              set("price", digits ? parseInt(digits, 10) : null);
            }}
            className={inputCls}
            placeholder="2500000000"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Satuan Harga">
            <select value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value as FormState["priceUnit"])} className={inputCls}>
              <option value="total">Total</option>
              <option value="per_bulan">Per Bulan</option>
              <option value="per_tahun">Per Tahun</option>
            </select>
          </Field>
          <label className="flex items-end gap-2 pb-3 text-sm font-medium">
            <input type="checkbox" checked={form.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="h-5 w-5 rounded accent-brand-600" />
            Nego
          </label>
        </div>
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

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-surface/95 p-3 backdrop-blur-lg pb-safe">
        <div className="flex gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 disabled:opacity-60 dark:bg-slate-700 dark:text-slate-100"
          >
            Simpan Draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="flex-[1.5] rounded-xl bg-brand-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : editing ? "Simpan & Publish" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
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
      {hint && <span className="mt-1 block text-xs text-brand-600 dark:text-brand-400">{hint}</span>}
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
