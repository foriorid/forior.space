"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { IconEdit, IconTrash, IconCheck, IconEye } from "./icons";

export function AdminListingRow({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const published = listing.status === "published";

  async function toggleStatus() {
    setBusy(true);
    await fetch(`/api/listings/${listing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: published ? "draft" : "published" }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Hapus listing "${listing.title}"?`)) return;
    setBusy(true);
    await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-line">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
        {listing.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.images[0].url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            —
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              published
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {published ? "PUBLISHED" : "DRAFT"}
          </span>
          <span className="text-[11px] text-[color:var(--muted)]">
            {PROPERTY_TYPE_LABELS[listing.propertyType]}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold">{listing.title}</h3>
        <div className="text-sm font-bold text-brand-700 dark:text-brand-300">
          {formatPrice(listing.price, listing.priceUnit)}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={toggleStatus}
            disabled={busy}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
              published
                ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                : "bg-emerald-600 text-white"
            }`}
          >
            {published ? <><IconEye width={13} height={13} /> Sembunyikan</> : <><IconCheck width={13} height={13} /> Publish</>}
          </button>
          <Link
            href={`/admin/edit/${listing.id}`}
            className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
          >
            <IconEdit width={13} height={13} /> Edit
          </Link>
          <button
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 disabled:opacity-50 dark:bg-red-600/15"
          >
            <IconTrash width={13} height={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
