import Link from "next/link";
import { getSettings } from "@/lib/store";
import { site, waLinkWith } from "@/lib/site";
import { withBase } from "@/lib/asset";
import { IconWhatsApp } from "./icons";

export async function Footer() {
  const settings = await getSettings();
  const wa = waLinkWith(
    settings.waNumber,
    `Halo ${settings.agentName}, saya ingin bertanya soal properti.`,
  );
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 px-4 pb-28 md:px-6">
      <div className="glass rounded-[26px] p-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/icon.svg")} alt="" width={28} height={28} className="rounded-xl" />
          <span className="text-base font-bold">{site.name}</span>
        </div>
        <p className="mt-2 max-w-sm text-sm text-[color:var(--muted)]">{site.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/" className="press">Beranda</Link>
          <Link href="/cari" className="press">Cari Properti</Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex items-center gap-1.5"
          >
            <IconWhatsApp width={16} height={16} /> WhatsApp
          </a>
        </div>

        <div className="mt-5 border-t border-line pt-4 text-xs text-[color:var(--muted)]">
          © {year} {site.name} — {settings.agentName}
        </div>
      </div>
    </footer>
  );
}
