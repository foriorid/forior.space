"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { resolvePricing, priceLines } from "@/lib/pricing";
import { IconEdit, IconTrash, IconCheck, IconEye } from "./icons";

const OPEN = 96; // px the card slides to reveal the delete action

export function AdminListingRow({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0); // 0 = closed, -OPEN = open
  const published = listing.status === "published";

  const pricing = resolvePricing(listing);
  const lines = priceLines(pricing);

  // Pointer-drag state (works for touch + mouse).
  const drag = useRef({
    startX: 0,
    startY: 0,
    base: 0,
    active: false,
    decided: false,
    horizontal: false,
    moved: false,
  });

  function onPointerDown(e: React.PointerEvent) {
    if (busy) return;
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      base: offset,
      active: true,
      decided: false,
      horizontal: false,
      moved: false,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.decided) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        d.decided = true;
        d.horizontal = Math.abs(dx) > Math.abs(dy);
        if (d.horizontal) {
          try {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          } catch {}
        }
      }
    }
    if (d.decided && d.horizontal) {
      d.moved = true;
      const next = Math.max(-OPEN, Math.min(0, d.base + dx));
      setOffset(next);
    }
  }

  function onPointerUp() {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.horizontal) {
      setOffset(offset < -OPEN / 2 ? -OPEN : 0);
    }
    // keep `moved` so the click-capture below can swallow a drag-click
    setTimeout(() => {
      drag.current.moved = false;
    }, 50);
  }

  function onClickCapture(e: React.MouseEvent) {
    // Swallow the click that ends a drag, and let a tap on an open row close it.
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (offset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setOffset(0);
    }
  }

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
    if (!confirm(`Hapus listing "${listing.title}"?`)) {
      setOffset(0);
      return;
    }
    setBusy(true);
    await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete action revealed on swipe-left */}
      <button
        onClick={remove}
        disabled={busy}
        aria-label="Hapus listing"
        style={{ width: OPEN }}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-red-500 text-white disabled:opacity-60"
      >
        <IconTrash width={20} height={20} />
        <span className="text-xs font-bold">Hapus</span>
      </button>

      {/* Sliding card (opaque so the red panel stays hidden when closed) */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        style={{
          transform: `translateX(${offset}px)`,
          transition: drag.current.active ? "none" : "transform 0.22s ease",
          touchAction: "pan-y",
          background: "var(--surface)",
        }}
        className="relative z-10 flex gap-3 rounded-2xl border border-line p-3"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
          {listing.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.images[0].url} alt="" className="h-full w-full object-cover" draggable={false} />
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
          <div className="text-sm font-bold">
            {lines.length > 1 ? (
              <span className="flex flex-wrap gap-x-2 gap-y-0 text-xs">
                {lines.map((l) => (
                  <span key={l.kind}>
                    <span className="text-[10px] font-semibold text-[color:var(--muted)]">{l.label} </span>
                    {l.value}
                  </span>
                ))}
              </span>
            ) : (
              lines[0]?.value ?? formatPrice(listing.price, listing.priceUnit)
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <button
              onClick={toggleStatus}
              disabled={busy}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                published
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {published ? <><IconEye width={13} height={13} /> Sembunyikan</> : <><IconCheck width={13} height={13} /> Publish</>}
            </button>
            <Link
              href={`/admin/edit/${listing.id}`}
              className="chip flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              <IconEdit width={13} height={13} /> Edit
            </Link>
            <span className="ml-auto select-none text-[10px] font-medium text-[color:var(--muted)]/70">
              ← geser untuk hapus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
