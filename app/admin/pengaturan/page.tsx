"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconCheck, IconUpload, IconTrash } from "@/components/icons";
import { compressImage } from "@/lib/image";

export default function SettingsPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setAgentName(d.settings?.agentName ?? "");
        setAvatarUrl(d.settings?.avatarUrl ?? "");
        // Show the number in local form (0813…) for familiarity.
        const wa: string = d.settings?.waNumber ?? "";
        setWaNumber(wa.startsWith("62") ? "0" + wa.slice(2) : wa);
      })
      .catch(() => setError("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  async function uploadPhoto(file: File) {
    setError("");
    setUploading(true);
    try {
      const blob = await compressImage(file, 512, 0.85);
      const fd = new FormData();
      fd.append("files", blob, "profil.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal upload foto");
      const d = await res.json();
      setAvatarUrl(d.images?.[0]?.url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, waNumber, avatarUrl }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Gagal menyimpan");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-1 text-sm font-semibold text-[color:var(--muted)]"
      >
        <IconArrowLeft width={18} height={18} /> Kembali
      </button>

      <h1 className="text-xl font-bold">Pengaturan</h1>

      {loading ? (
        <div className="glass rounded-2xl p-6 text-center text-sm text-[color:var(--muted)]">
          Memuat…
        </div>
      ) : (
        <form onSubmit={save} className="glass space-y-4 rounded-[26px] p-5">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
              Foto Profil
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#141d30] to-[#070b16] text-xl font-bold text-accent">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  (agentName || "F").slice(0, 1).toUpperCase()
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="press flex items-center gap-1.5 rounded-xl border border-line bg-surface/60 px-3 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <IconUpload width={16} height={16} />
                {uploading ? "Mengunggah…" : avatarUrl ? "Ganti foto" : "Unggah foto"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="press flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-600/15"
                  aria-label="Hapus foto"
                >
                  <IconTrash width={16} height={16} />
                </button>
              )}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">
              Nama Agen / Brand
            </span>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className={inputCls}
              placeholder="Forior Space"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">
              Nomor WhatsApp
            </span>
            <input
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              inputMode="tel"
              className={inputCls}
              placeholder="081379097488"
            />
            <span className="mt-1 block text-xs text-[color:var(--muted)]">
              Nomor ini dipakai tombol &ldquo;Hubungi&rdquo; di setiap listing.
            </span>
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {saved && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <IconCheck width={16} height={16} /> Tersimpan
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-accent press w-full rounded-full py-3 text-sm font-bold disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan Pengaturan"}
          </button>
        </form>
      )}
    </div>
  );
}
