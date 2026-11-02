"use client";

import { useEffect } from "react";
import { IS_STATIC } from "@/lib/asset";

/** Registers the service worker so the site is installable & works offline. */
export function ServiceWorker() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production" ||
      IS_STATIC
    ) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration errors */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
