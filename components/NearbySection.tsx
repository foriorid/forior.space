import type { ComponentType, SVGProps } from "react";
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

/** "Fasilitas Akses Sekitar" — nearby places grouped by category. */
export function NearbySection({ items }: { items?: NearbyPlace[] }) {
  const groups = groupNearby(items);
  if (groups.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-base font-bold">Fasilitas Akses Sekitar</h2>
      <div className="space-y-4">
        {groups.map(({ category, places }) => {
          const Icon = CATEGORY_ICON[category];
          return (
            <div key={category}>
              <div className="mb-2 flex items-center gap-2 text-[color:var(--muted)]">
                <Icon width={16} height={16} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  {NEARBY_CATEGORY_LABELS[category]}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {places.map((p, i) => (
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
