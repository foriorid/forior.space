import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_STATIC === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = isStatic
  ? {
      // Static export for the GitHub Pages UI preview (no server features).
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      // Normal server build (full app: AI parsing, auth, uploads, etc.)
    };

export default nextConfig;
