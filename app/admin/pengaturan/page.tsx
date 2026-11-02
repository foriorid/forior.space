"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconCheck } from "@/components/icons";

export default function SettingsPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setAgentName(d.settings?.agentName ?? "");
        // Show the number in local form (0813…) for familiarity.
        const wa: string = d.settings?.waNumber ?? "";
        setWaNumber(wa.startsWith("62") ? "0" + wa.slice(2) : wa);
      })
      .catch(() => setError("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, waNumber }),
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
