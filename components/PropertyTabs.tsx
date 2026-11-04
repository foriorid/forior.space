"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import type { NearbyCategory, NearbyPlace } from "@/lib/types";
import { NEARBY_CATEGORY_LABELS } from "@/lib/types";
import { groupNearby } from "@/lib/nearby";
import { amenityIconKey, type AmenityIconKey } from "@/lib/amenities";
import {
  IconPool,
  IconDumbbell,
  IconRun,
  IconShield,
  IconWifi,
  IconCar,
  IconTree,
  IconCart,
  IconLift,
  IconBuilding,
  IconSparkles,
  IconHospital,
  IconSchool,
  IconTrain,
  IconUtensils,
  IconMosque,
  IconPin,
  IconClock,
  IconCheck,
} from "./icons";

const AMENITY_ICON: Record<AmenityIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  pool: IconPool,
  gym: IconDumbbell,
  run: IconRun,
  shield: IconShield,
  wifi: IconWifi,
  car: IconCar,
  tree: IconTree,
  mall: IconCart,
  lift: IconLift,
  building: IconBuilding,
  default: IconSparkles,
};

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

const PREVIEW = 3;

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function titleCase(s: string): string {
  const small = new Set(["di", "dan", "yang", "untuk", "ke", "dari", "pada", "&"]);
  return s
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w, i) =>
      i > 0 && small.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

/** Drop keunggulan items that are really building amenities (already shown there). */
function dedupeKeunggulan(keun: string[], amenities: string[]): string[] {
  const amenNorm = new Set(amenities.map(norm));
  const amenKeys = new Set(
    amenities.map((a) => amenityIconKey(a)).filter((k) => k !== "default"),
  );
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of keun) {
    const t = raw.trim();
    if (!t) continue;
    const n = norm(t);
    if (seen.has(n) || amenNorm.has(n)) continue;
    const key = amenityIconKey(t);
    if (key !== "default" && amenKeys.has(key)) continue; // same amenity type
    seen.add(n);
    out.push(t);
  }
  return out;
}

type TabKey = "fasilitas" | "keunggulan" | "lokasi";
const LABELS: Record<TabKey, string> = {
  fasilitas: "Fasilitas",
  keunggulan: "Keunggulan",
  lokasi: "Sekitar",
};

export function PropertyTabs({
  amenities,
  keunggulan,
  nearby,
}: {
  amenities?: string[];
  keunggulan?: string[];
  nearby?: NearbyPlace[];
}) {
  const amen = (amenities ?? []).filter((s) => s.trim());
  const keun = dedupeKeunggulan(keunggulan ?? [], amen);
  const groups = groupNearby(nearby);

  const tabs: TabKey[] = [];
  if (amen.length) tabs.push("fasilitas");
  if (keun.length) tabs.push("keunggulan");
  if (groups.length) tabs.push("lokasi");

  const [active, setActive] = useState<TabKey>(tabs[0] ?? "fasilitas");
  if (tabs.length === 0) return null;
  const cur = tabs.includes(active) ? active : tabs[0];

  return (
    <div>
      {tabs.length > 1 ? (
        <div className="glass mb-4 flex rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`press flex-1 rounded-full py-2 text-sm font-semibold transition ${
                cur === t ? "bg-foreground text-background" : "text-[color:var(--muted)]"
              }`}
            >
              {LABELS[t]}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="mb-3 text-base font-bold">
          {cur === "lokasi" ? "Area Sekitar" : `${LABELS[cur]} Properti`}
        </h2>
      )}

      {cur === "fasilitas" && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {amen.map((name, i) => {
            const Icon = AMENITY_ICON[amenityIconKey(name)];
            return (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-[color:var(--foreground)]">
                  <Icon width={16} height={16} />
                </span>
                <span className="text-sm leading-tight">{name}</span>
              </div>
            );
          })}
        </div>
      )}

      {cur === "keunggulan" && (
        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {keun.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{titleCase(f)}</span>
            </div>
          ))}
        </div>
      )}

      {cur === "lokasi" && (
        <div className="space-y-4">
          {groups.map(({ category, places }) => (
            <CategoryGroup key={category} category={category} places={places} />
          ))}
        </div>
      )}
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
