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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                active ? "text-brand-600 dark:text-brand-400" : "text-[color:var(--muted)]"
              }`}
            >
              <Icon width={23} height={23} strokeWidth={active ? 2.4 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
