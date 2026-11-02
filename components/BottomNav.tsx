"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconSearch, IconUser } from "./icons";
import { IS_STATIC } from "@/lib/asset";

const allTabs = [
  { href: "/", label: "Beranda", icon: IconHome, match: (p: string) => p === "/" },
  { href: "/cari", label: "Cari", icon: IconSearch, match: (p: string) => p.startsWith("/cari") },
  { href: "/admin", label: "Agen", icon: IconUser, match: (p: string) => p.startsWith("/admin") },
];

// The static GitHub Pages preview has no server, so hide the Agen tab there.
const tabs = IS_STATIC ? allTabs.filter((t) => t.href !== "/admin") : allTabs;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="glass-strong flex items-center gap-1 rounded-full p-1.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`press flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-accent text-accent-ink shadow-[0_8px_20px_-8px_rgba(194,242,74,0.8)]"
                  : "text-[color:var(--muted)]"
              }`}
            >
              <Icon width={21} height={21} strokeWidth={active ? 2.4 : 2} />
              {active && <span>{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
