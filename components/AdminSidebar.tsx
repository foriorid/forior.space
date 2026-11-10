"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconPlus, IconEye, IconLogout } from "./icons";

function IconGrid(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconGear(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.5a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.5 14H2a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.5 7L4.4 7a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.5V4a2 2 0 1 1 4 0v.2A1.6 1.6 0 0 0 17 7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.4 1.8Z" />
    </svg>
  );
}

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: IconGrid, match: (p: string) => p === "/admin" },
  { href: "/admin/new", label: "Tambah", Icon: IconPlus, match: (p: string) => p.startsWith("/admin/new") || p.startsWith("/admin/edit") },
  { href: "/admin/pengaturan", label: "Pengaturan", Icon: IconGear, match: (p: string) => p.startsWith("/admin/pengaturan") },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/masuk");
    router.refresh();
  }

  const item =
    "flex h-11 w-11 items-center justify-center rounded-[14px] text-[color:var(--muted)] transition hover:bg-black/[0.05]";
  const active = "bg-[color:var(--foreground)] text-[color:var(--background)] hover:bg-[color:var(--foreground)]";

  return (
    <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-[72px] shrink-0 flex-col items-center gap-2 rounded-[26px] border border-line bg-surface/80 py-4 backdrop-blur-sm lg:flex">
      <Link href="/admin" className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent" aria-label="Forior Space">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#17210a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      </Link>

      {NAV.map(({ href, label, Icon, match }) => (
        <Link key={href} href={href} aria-label={label} title={label} className={`${item} ${match(pathname) ? active : ""}`}>
          <Icon width={20} height={20} />
        </Link>
      ))}

      <div className="flex-1" />

      <Link href="/" aria-label="Lihat situs" title="Lihat situs" className={item}>
        <IconEye width={20} height={20} />
      </Link>
      <button onClick={logout} aria-label="Keluar" title="Keluar" className={`${item} text-red-500 hover:bg-red-500/10`}>
        <IconLogout width={20} height={20} />
      </button>
    </aside>
  );
}
