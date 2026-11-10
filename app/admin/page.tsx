import Link from "next/link";
import { getListings, getSettings } from "@/lib/store";
import { BlurImage } from "@/components/BlurImage";
import { IconPlus, IconSparkles, IconChevronRight, IconWhatsApp, IconPin } from "@/components/icons";
import { hasApiKey } from "@/lib/parse";
import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";
import { resolvePricing, priceLines } from "@/lib/pricing";
import { locationLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [listings, settings] = await Promise.all([getListings({}), getSettings()]);
  const total = listings.length;
  const published = listings.filter((l) => l.status === "published").length;
  const drafts = total - published;

  // Simple distributions (no revenue/transactions).
  const byType = new Map<PropertyType, number>();
  let forSale = 0;
  let forRent = 0;
  for (const l of listings) {
    byType.set(l.propertyType, (byType.get(l.propertyType) ?? 0) + 1);
    const p = resolvePricing(l);
    if (p.forSale) forSale++;
    if (p.forRent) forRent++;
  }
  const typeRows = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const topType = typeRows[0];
  const maxType = typeRows[0]?.[1] ?? 1;
  const pubPct = total ? Math.round((published / total) * 100) : 0;

  const featured = listings.find((l) => l.images[0]) ?? listings[0];
  const board = listings.filter((l) => l.id !== featured?.id).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Greeting + CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[color:var(--muted)]">
            Halo, {settings.agentName} 👋 — ringkasan listing kamu.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="btn-accent press hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold sm:flex"
        >
          <IconPlus width={18} height={18} /> Tambah Listing
        </Link>
      </div>

      {!hasApiKey() && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          <strong>Mode tanpa AI.</strong> Set <code>ANTHROPIC_API_KEY</code> di environment
          agar parsing chat &amp; foto otomatis aktif.
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={total} label="Total Listing" />
        <Stat value={published} label="Published" />
        <Stat value={drafts} label="Draft" />
        <Stat
          value={topType ? PROPERTY_TYPE_LABELS[topType[0]] : "—"}
          label={topType ? `Tipe Terbanyak · ${topType[1]}` : "Tipe Terbanyak"}
        />
      </div>

      {total === 0 ? (
        <div className="glass rounded-[26px] p-8 text-center text-sm text-[color:var(--muted)]">
          Belum ada listing. Klik <strong>Tambah Listing</strong> untuk menambah.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.9fr_1fr] lg:items-start">
          {/* Listing board */}
          <section className="glass overflow-hidden rounded-[26px]">
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="text-base font-bold">Listing Terbaru</h2>
              <span className="text-xs font-semibold text-[color:var(--muted)]">
                {total} listing
              </span>
            </div>

            {featured && <Featured listing={featured} />}

            <div className="p-3 pt-1">
              {board.map((l) => {
                const lines = priceLines(resolvePricing(l));
                const pub = l.status === "published";
                return (
                  <Link
                    key={l.id}
                    href={`/admin/edit/${l.id}`}
                    className="press flex items-center gap-3 rounded-2xl p-2.5 hover:bg-black/[0.03]"
                  >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                      {l.images[0] && (
                        <BlurImage src={l.images[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-semibold">{l.title}</div>
                      <div className="text-xs text-[color:var(--muted)]">
                        {PROPERTY_TYPE_LABELS[l.propertyType]}
                        {l.city ? ` · ${l.city}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{lines[0]?.value ?? "—"}</div>
                      <span
                        className={`text-[10px] font-bold ${
                          pub ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {pub ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Simple stats */}
          <section className="glass space-y-5 rounded-[26px] p-5">
            <div>
              <h2 className="mb-4 text-sm font-bold">Status Publikasi</h2>
              <div className="flex items-center gap-5">
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#0fae7a 0 ${pubPct}%, #e0a019 ${pubPct}% 100%)`,
                  }}
                >
                  <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-[color:var(--surface)]">
                    <span className="text-xl font-extrabold leading-none">{total}</span>
                    <span className="text-[10px] font-bold text-[color:var(--muted)]">LISTING</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Published
                    <span className="ml-auto text-[color:var(--muted)]">{published}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-amber-500" /> Draft
                    <span className="ml-auto text-[color:var(--muted)]">{drafts}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <h2 className="mb-3 text-sm font-bold">Berdasarkan Tipe</h2>
              <div className="space-y-3">
                {typeRows.slice(0, 5).map(([t, n]) => (
                  <div key={t}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      {PROPERTY_TYPE_LABELS[t]}
                      <span className="text-[color:var(--muted)]">{n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(n / maxType) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <h2 className="mb-3 text-sm font-bold">Pemasaran</h2>
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl bg-black/[0.03] p-3">
                  <div className="text-xl font-extrabold">{forSale}</div>
                  <div className="text-[11px] font-semibold text-[color:var(--muted)]">Dijual</div>
                </div>
                <div className="flex-1 rounded-2xl bg-black/[0.03] p-3">
                  <div className="text-xl font-extrabold">{forRent}</div>
                  <div className="text-[11px] font-semibold text-[color:var(--muted)]">Disewa</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

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
          <div className="text-xs text-[color:var(--muted)]">Pengaturan agen &amp; WhatsApp</div>
        </div>
        <IconChevronRight width={16} height={16} className="text-[color:var(--muted)]" />
      </Link>

      {/* Mobile FAB */}
      <Link
        href="/admin/new"
        className="btn-accent press fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full sm:hidden"
        aria-label="Tambah listing"
      >
        <IconPlus width={28} height={28} />
      </Link>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[26px] font-extrabold leading-tight tracking-tight">{value}</div>
      <div className="text-xs font-semibold text-[color:var(--muted)]">{label}</div>
    </div>
  );
}

function Featured({ listing }: { listing: Awaited<ReturnType<typeof getListings>>[number] }) {
  const pricing = resolvePricing(listing);
  const lines = priceLines(pricing);
  return (
    <Link href={`/admin/edit/${listing.id}`} className="press group relative m-4 mt-2 block h-56 overflow-hidden rounded-[22px] bg-slate-300">
      {listing.images[0] && (
        <BlurImage src={listing.images[0].url} alt="" eager className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <div className="mb-2 flex gap-1.5">
          {pricing.forSale && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">Dijual</span>
          )}
          {pricing.forRent && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold">Disewa</span>
          )}
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-extrabold">{listing.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/85">
              <IconPin width={14} height={14} /> {locationLabel(listing) || "Lokasi belum diisi"}
            </p>
          </div>
          <div className="shrink-0 text-lg font-extrabold">{lines[0]?.value}</div>
        </div>
      </div>
    </Link>
  );
}
