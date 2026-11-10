import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { IconWhatsApp } from "@/components/icons";
import { getSettings } from "@/lib/store";
import { site, waLinkWith } from "@/lib/site";
import { withBase, IS_STATIC } from "@/lib/asset";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const hubungiHref = waLinkWith(
    settings.waNumber,
    `Halo ${settings.agentName}, saya ingin bertanya soal properti.`,
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-[1600px]">
      <header className="relative z-30 px-4 pt-safe md:px-6">
        <div className="mt-3 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/icon.svg")} alt="" width={32} height={32} className="rounded-xl" />
            <span className="text-[18px] font-bold tracking-tight">{site.name}</span>
          </Link>
          <a
            href={hubungiHref}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm"
          >
            <IconWhatsApp width={14} height={14} /> Hubungi
          </a>
        </div>
        {IS_STATIC && (
          <div className="mt-2 px-1 text-[11px] leading-tight text-[color:var(--muted)]">
            Preview tampilan (data contoh). Fitur chat AI, login & upload aktif
            saat dijalankan dengan server — lihat README.
          </div>
        )}
      </header>

      <main className="px-4 pt-4 md:px-6">{children}</main>

      <Footer />
      <BottomNav />
    </div>
  );
}
