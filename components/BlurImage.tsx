"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/asset";

/**
 * <img> that stays transparent (showing the container's placeholder
 * background) until the photo is fully decoded, then fades in. On a slow
 * connection this avoids the "half-painted / blank" flash — you see a clean
 * placeholder, then the whole photo appears at once.
 */
export function BlurImage({
  src,
  alt,
  className = "",
  eager = false,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before React attaches onLoad — catch that.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={withBase(src)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onClick={onClick}
      onLoad={() => setLoaded(true)}
      className={`${className} transition duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
