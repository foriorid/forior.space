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
    <div className="mx-auto min-h-dvh w-full max-w-md md:max-w-3xl lg:max-w-5xl">
      <header className="sticky top-0 z-30 px-4 pt-safe md:px-6">
        <div className="glass mt-3 flex h-14 items-center justify-between rounded-2xl px-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/icon.svg")} alt="" width={30} height={30} className="rounded-xl" />
            <span className="text-[17px] font-bold tracking-tight">{site.name}</span>
          </Link>
          {!IS_STATIC && (
            <Link
              href="/admin"
              className="press rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-xs font-semibold"
            >
              Agen
            </Link>
          )}
        </div>
        {IS_STATIC && (
          <div className="mt-2 px-1 text-[11px] leading-tight text-[color:var(--muted)]">
            Preview tampilan (data contoh). Fitur chat AI, login & upload aktif
            saat dijalankan dengan server — lihat README.
          </div>
        )}
      </header>

      <main className="px-4 pb-32 pt-4 md:px-6">{children}</main>

      <BottomNav />
    </div>
  );
}
