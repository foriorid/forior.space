"use client";

import { useRef, useState } from "react";
import { withBase } from "@/lib/asset";

export function PhotoCarousel({
  images,
  title,
  onPhotoClick,
}: {
  images: { url: string }[];
  title: string;
  /** Called with the tapped photo index (used to open the lightbox). */
  onPhotoClick?: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-200 text-slate-400">
        Tanpa foto
      </div>
    );
  }

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(idx);
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={withBase(img.url)}
            alt={`${title} — foto ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            onClick={onPhotoClick ? () => onPhotoClick(i) : undefined}
            className={`h-full w-full shrink-0 snap-center object-cover ${
              onPhotoClick ? "cursor-zoom-in" : ""
            }`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            {active + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
