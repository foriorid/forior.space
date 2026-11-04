"use client";

import { useState } from "react";
import { IconShare, IconCheck } from "./icons";

/**
 * Minimalist icon-only share control. Uses the native Web Share sheet on
 * supported devices, and falls back to copying the link to the clipboard.
 */
export function ShareButton({
  title,
  text,
  className = "",
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data: ShareData = { title, text: text || title, url };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to copy
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={share}
      aria-label={copied ? "Link tersalin" : "Bagikan properti"}
      title={copied ? "Link tersalin" : "Bagikan"}
      className={`glass-strong press flex h-11 w-11 items-center justify-center rounded-full ${className}`}
    >
      {copied ? (
        <IconCheck width={20} height={20} className="text-emerald-500" />
      ) : (
        <IconShare width={19} height={19} />
      )}
    </button>
  );
}
