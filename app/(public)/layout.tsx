import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { site } from "@/lib/site";
import { withBase, IS_STATIC } from "@/lib/asset";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 px-4 backdrop-blur-lg pt-safe">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/icon.svg")} alt="" width={28} height={28} className="rounded-lg" />
            <span className="text-lg font-extrabold tracking-tight">{site.name}</span>
          </Link>
          {!IS_STATIC && (
            <Link
              href="/admin"
              className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
            >
              Agen
            </Link>
          )}
        </div>
        {IS_STATIC && (
          <div className="pb-2 text-[11px] leading-tight text-[color:var(--muted)]">
            Preview tampilan (data contoh). Fitur chat AI, login & upload aktif
            saat dijalankan dengan server — lihat README.
          </div>
        )}
      </header>

      <main className="px-4 pb-28 pt-4">{children}</main>

      <BottomNav />
    </div>
  );
}
