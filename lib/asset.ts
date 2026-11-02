/**
 * Prefix for static assets.
 *
 * Empty in the normal (server) app. When exporting a static preview for
 * GitHub Pages (served from a sub-folder like /future-pro), set
 * NEXT_PUBLIC_BASE_PATH=/future-pro so raw <img> / icon URLs resolve.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** True when building the static GitHub Pages preview (no server features). */
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";

/** Prefix an absolute local path with the base path (no-op for remote/empty). */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  return BASE_PATH + path;
}
