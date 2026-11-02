"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconSearch } from "./icons";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";

export interface FilterValues {
  q: string;
  jenis: "" | "jual" | "sewa";
  tipe: "" | PropertyType;
  kota: string;
}

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

export function FilterBar({ initial }: { initial: FilterValues }) {
  const router = useRouter();
  const [values, setValues] = useState<FilterValues>(initial);
  const first = useRef(true);

  // Push URL changes (debounced) whenever filters change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const qs = new URLSearchParams();
      if (values.q) qs.set("q", values.q);
      if (values.jenis) qs.set("jenis", values.jenis);
      if (values.tipe) qs.set("tipe", values.tipe);
      if (values.kota) qs.set("kota", values.kota);
      router.replace(qs.toString() ? `/cari?${qs}` : "/cari", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [values, router]);

  const set = (patch: Partial<FilterValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  return (
    <div className="space-y-3">
      {/* Search box */}
      <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 shadow-sm ring-1 ring-line">
        <IconSearch width={18} height={18} className="text-[color:var(--muted)]" />
        <input
          value={values.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Cari judul, lokasi…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
        />
      </div>

      {/* Jenis segmented */}
      <div className="flex rounded-xl bg-surface p-1 shadow-sm ring-1 ring-line">
        {([
          ["", "Semua"],
          ["jual", "Dijual"],
          ["sewa", "Disewa"],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => set({ jenis: val })}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              values.jenis === val
                ? "bg-brand-600 text-white shadow"
                : "text-[color:var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Property type chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={values.tipe === ""} onClick={() => set({ tipe: "" })}>
          Semua tipe
        </Chip>
        {PROPERTY_TYPES.map((t) => (
          <Chip key={t} active={values.tipe === t} onClick={() => set({ tipe: t })}>
            {PROPERTY_TYPE_LABELS[t]}
          </Chip>
        ))}
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
        active
          ? "bg-brand-600 text-white"
          : "bg-surface text-[color:var(--muted)] ring-1 ring-line"
      }`}
    >
      {children}
    </button>
  );
}
