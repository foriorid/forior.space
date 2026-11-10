"use client";

import { useEffect, useRef, useState } from "react";
import { BlurImage } from "./BlurImage";
import { PhotoCarousel } from "./PhotoCarousel";

/**
 * Listing photo gallery.
 * - Mobile: swipeable carousel; tapping a photo opens the lightbox.
 * - Desktop: 1 big photo + a 2x2 grid; when there are more than 5 photos the
 *   last visible cell shows a "+N" overlay. Any photo opens the lightbox.
 * - Lightbox: fullscreen, horizontal swipe (left ↔ right) between photos.
 */
export function PhotoGallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(0);
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") scrollBy(1);
      if (e.key === "ArrowLeft") scrollBy(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Jump the lightbox scroller to the photo that was tapped, once it's mounted.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = start * el.clientWidth;
      setActive(start);
    }
  }, [open, start]);

  function openAt(i: number) {
    setStart(i);
    setActive(i);
    setOpen(true);
  }

  function onLightboxScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollBy(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: (active + dir) * el.clientWidth, behavior: "smooth" });
  }

  const right = images.slice(1, 5);
  const extra = images.length - 5;

  return (
    <>
      {/* Mobile: carousel (tap to open lightbox) */}
      <div className="overflow-hidden rounded-[24px] lg:hidden">
        <PhotoCarousel images={images} title={title} onPhotoClick={openAt} />
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:block">
        {images.length <= 1 ? (
          <button
            onClick={() => images.length && openAt(0)}
            className="block h-[440px] w-full overflow-hidden rounded-[24px] bg-slate-300/40"
          >
            {images[0] ? (
              <BlurImage src={images[0].url} alt={title} eager className="h-full w-full object-cover" />
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
              <BlurImage
                src={images[0].url}
                alt={title}
                eager
                className="h-full w-full object-cover group-hover:scale-[1.03]"
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
                    <BlurImage
                      src={img.url}
                      alt={`${title} ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-[1.03]"
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

      {/* Lightbox — horizontal swipe */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="text-sm font-semibold">
              {active + 1} / {images.length}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold"
            >
              Tutup ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            onScroll={onLightboxScroll}
            className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-3"
              >
                <BlurImage
                  src={img.url}
                  alt={`${title} ${i + 1}`}
                  className="max-h-full max-w-full rounded-2xl object-contain"
                />
              </div>
            ))}
          </div>

          {/* Desktop arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Sebelumnya"
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white lg:flex"
              >
                ‹
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Berikutnya"
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white lg:flex"
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollBy(i - active)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
