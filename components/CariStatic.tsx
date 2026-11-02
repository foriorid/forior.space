"use client";

import { useMemo, useState } from "react";
import type { Listing, PropertyType } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { IconSearch } from "./icons";

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

/**
 * Client-side search used only in the static GitHub Pages preview, where there
 * is no server to filter. Filters the embedded listing list in memory.
 */
export function CariStatic({ listings }: { listings: Listing[] }) {
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState<"" | "jual" | "sewa">("");
  const [tipe, setTipe] = useState<"" | PropertyType>("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return listings.filter((l) => {
      if (jenis && l.listingType !== jenis) return false;
      if (tipe && l.propertyType !== tipe) return false;
      if (query) {
        const hay = [l.title, l.description, l.address, l.city]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [listings, q, jenis, tipe]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Cari Properti</h1>

      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 shadow-sm ring-1 ring-line">
          <IconSearch width={18} height={18} className="text-[color:var(--muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, lokasi…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
          />
        </div>

        <div className="flex rounded-xl bg-surface p-1 shadow-sm ring-1 ring-line">
          {([
            ["", "Semua"],
            ["jual", "Dijual"],
            ["sewa", "Disewa"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setJenis(val)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                jenis === val ? "bg-brand-600 text-white shadow" : "text-[color:var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={tipe === ""} onClick={() => setTipe("")}>
            Semua tipe
          </Chip>
          {PROPERTY_TYPES.map((t) => (
            <Chip key={t} active={tipe === t} onClick={() => setTipe(t)}>
              {PROPERTY_TYPE_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm text-[color:var(--muted)]">
          {results.length} properti ditemukan
        </p>
        {results.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center text-sm text-[color:var(--muted)] ring-1 ring-line">
            Tidak ada properti yang cocok. Coba ubah filter.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "bg-brand-600 text-white" : "bg-surface text-[color:var(--muted)] ring-1 ring-line"
      }`}
    >
      {children}
    </button>
  );
}
