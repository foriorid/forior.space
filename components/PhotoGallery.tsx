"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/asset";
import { PhotoCarousel } from "./PhotoCarousel";

/**
 * Listing photo gallery.
 * - Mobile: swipeable carousel.
 * - Desktop: 1 big photo + a 2x2 grid; when there are more than 5 photos the
 *   last visible cell shows a "+N" overlay. Any photo opens a full lightbox.
 */
export function PhotoGallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [, setStart] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openAt(i: number) {
    setStart(i);
    setOpen(true);
  }

  const right = images.slice(1, 5);
  const extra = images.length - 5;

  return (
    <>
      {/* Mobile: carousel */}
      <div className="overflow-hidden rounded-[24px] lg:hidden">
        <PhotoCarousel images={images} title={title} />
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:block">
        {images.length <= 1 ? (
          <button
            onClick={() => images.length && openAt(0)}
            className="block h-[440px] w-full overflow-hidden rounded-[24px] bg-slate-300/40"
          >
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={withBase(images[0].url)} alt={title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[color:var(--muted)]">
                Tanpa foto
              </span>
            )}
          </button>
        ) : (
          <div className="flex h-[440px] gap-2">
            <button
              onClick={() => openAt(0)}
              className="group h-full flex-1 overflow-hidden rounded-2xl bg-slate-300/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBase(images[0].url)}
                alt={title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </button>
            <div
              className={`grid h-full flex-1 gap-2 ${
                right.length === 1 ? "grid-cols-1" : "grid-cols-2 grid-rows-2"
              }`}
            >
              {right.map((img, i) => {
                const idx = i + 1;
                const isLastVisible = i === right.length - 1;
                const showOverlay = isLastVisible && extra > 0;
                return (
                  <button
                    key={idx}
                    onClick={() => openAt(idx)}
                    className="group relative overflow-hidden rounded-2xl bg-slate-300/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={withBase(img.url)}
                      alt={`${title} ${idx + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    {showOverlay && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white backdrop-blur-sm">
                        <span className="text-xl font-bold">+{extra}</span>
                        <span className="text-xs font-medium">Lihat semua foto</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-black/60 px-5 py-4 text-white backdrop-blur">
            <span className="text-sm font-semibold">{images.length} Foto</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold"
            >
              Tutup ✕
            </button>
          </div>
          <div className="mx-auto max-w-3xl space-y-3 p-4">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={withBase(img.url)}
                alt={`${title} ${i + 1}`}
                className="w-full rounded-2xl"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
