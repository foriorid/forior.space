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
      // Keep sharp external so its native linux-x64 binary is traced into the
      // serverless function (otherwise it fails to load at runtime).
      serverExternalPackages: ["sharp"],
    };

export default nextConfig;
