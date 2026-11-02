import Link from "next/link";
import { getListings } from "@/lib/store";
import { AdminListingRow } from "@/components/AdminListingRow";
import { IconPlus, IconSparkles } from "@/components/icons";
import { hasApiKey } from "@/lib/parse";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const listings = await getListings({}); // all statuses
  const published = listings.filter((l) => l.status === "published").length;
  const drafts = listings.length - published;

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
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/25 active:scale-[0.99]"
      >
        <IconSparkles width={22} height={22} />
        Tambah Listing via Chat
      </Link>

      {/* List */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-[color:var(--muted)]">
          SEMUA LISTING ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center text-sm text-[color:var(--muted)] ring-1 ring-line">
            Belum ada listing. Klik tombol di atas untuk menambah.
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <AdminListingRow key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/admin/new"
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 active:scale-95 md:hidden"
        aria-label="Tambah listing"
      >
        <IconPlus width={28} height={28} />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-medium text-[color:var(--muted)]">{label}</div>
    </div>
  );
}
