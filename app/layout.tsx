import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { withBase } from "@/lib/asset";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  manifest: withBase("/manifest.webmanifest"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.name,
  },
  icons: {
    icon: withBase("/icon.svg"),
    apple: withBase("/icon-192.png"),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
