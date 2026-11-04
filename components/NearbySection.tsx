"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import type { NearbyCategory, NearbyPlace } from "@/lib/types";
import { NEARBY_CATEGORY_LABELS } from "@/lib/types";
import { groupNearby } from "@/lib/nearby";
import {
  IconCart,
  IconHospital,
  IconSchool,
  IconTrain,
  IconUtensils,
  IconMosque,
  IconTree,
  IconPin,
  IconClock,
} from "./icons";

const CATEGORY_ICON: Record<NearbyCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  swalayan: IconCart,
  rumah_sakit: IconHospital,
  sekolah: IconSchool,
  transportasi: IconTrain,
  kuliner: IconUtensils,
  ibadah: IconMosque,
  rekreasi: IconTree,
  lainnya: IconPin,
};

const PREVIEW = 3; // items shown per category before "load more"

/** "Lokasi & Tempat Sekitar" — nearby places grouped by category. */
export function NearbySection({ items }: { items?: NearbyPlace[] }) {
  const groups = groupNearby(items);
  if (groups.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-base font-bold">Lokasi &amp; Tempat Sekitar</h2>
      <div className="space-y-4">
        {groups.map(({ category, places }) => (
          <CategoryGroup key={category} category={category} places={places} />
        ))}
      </div>
    </div>
  );
}

function CategoryGroup({
  category,
  places,
}: {
  category: NearbyCategory;
  places: NearbyPlace[];
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICON[category];
  const visible = expanded ? places : places.slice(0, PREVIEW);
  const hidden = places.length - PREVIEW;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[color:var(--muted)]">
        <Icon width={16} height={16} />
        <span className="text-xs font-bold uppercase tracking-wide">
          {NEARBY_CATEGORY_LABELS[category]}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visible.map((p, i) => (
          <div
            key={i}
            className="glass flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-[color:var(--foreground)]">
                <Icon width={16} height={16} />
              </span>
              <span className="truncate text-sm font-medium">{p.name}</span>
            </div>
            {p.time && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[color:var(--muted)]">
                <IconClock width={13} height={13} />
                {p.time}
              </span>
            )}
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="press mt-2 text-xs font-bold text-[color:var(--foreground)]/70 underline-offset-2 hover:underline"
        >
          {expanded ? "Tampilkan lebih sedikit" : `Lihat ${hidden} lainnya`}
        </button>
      )}
    </div>
  );
}
