import Link from "next/link";
import { getListings, getSettings } from "@/lib/store";
import { AdminListingRow } from "@/components/AdminListingRow";
import { IconPlus, IconSparkles, IconChevronRight, IconWhatsApp } from "@/components/icons";
import { hasApiKey } from "@/lib/parse";
import { toLocalPhone } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const listings = await getListings({}); // all statuses
  const published = listings.filter((l) => l.status === "published").length;
  const drafts = listings.length - published;
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      {/* AI status banner */}
      {!hasApiKey() && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          <strong>Mode tanpa AI.</strong> Set <code>ANTHROPIC_API_KEY</code> di
          environment agar parsing chat & foto otomatis aktif. Saat ini memakai
          parser sederhana.
        </div>
      )}

      {/* Stats + CTA */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Published" value={published} />
        <Stat label="Draft" value={drafts} />
      </div>

      <Link
        href="/admin/new"
        className="btn-accent press flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold"
      >
        <IconSparkles width={22} height={22} />
        Tambah Listing via Chat
      </Link>

      {/* Settings quick row */}
      <Link
        href="/admin/pengaturan"
        className="glass press flex items-center gap-3 rounded-2xl p-3.5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/18">
          <IconWhatsApp width={20} height={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{settings.agentName}</div>
          <div className="text-xs text-[color:var(--muted)]">
            WhatsApp: {toLocalPhone(settings.waNumber)}
          </div>
        </div>
        <span className="text-xs font-semibold text-[color:var(--muted)]">Ubah</span>
        <IconChevronRight width={16} height={16} className="text-[color:var(--muted)]" />
      </Link>

      {/* List */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-[color:var(--muted)]">
          SEMUA LISTING ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <div className="glass rounded-[26px] p-8 text-center text-sm text-[color:var(--muted)]">
            Belum ada listing. Klik tombol di atas untuk menambah.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {listings.map((l) => (
              <AdminListingRow key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/admin/new"
        className="btn-accent press fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full md:hidden"
        aria-label="Tambah listing"
      >
        <IconPlus width={28} height={28} />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium text-[color:var(--muted)]">{label}</div>
    </div>
  );
}
