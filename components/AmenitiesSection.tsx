import type { ComponentType, SVGProps } from "react";
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
} from "./icons";

const ICONS: Record<AmenityIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
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

/** "Fasilitas Properti" — building amenities as icon + text, in a tidy grid. */
export function AmenitiesSection({ items }: { items?: string[] }) {
  const list = (items ?? []).filter((s) => s.trim());
  if (list.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-base font-bold">Fasilitas Properti</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((name, i) => {
          const Icon = ICONS[amenityIconKey(name)];
          return (
            <div
              key={i}
              className="glass flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-[color:var(--foreground)]">
                <Icon width={16} height={16} />
              </span>
              <span className="min-w-0 text-[13px] font-medium leading-tight">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
