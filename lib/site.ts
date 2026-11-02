/** Site-wide config, overridable via environment variables. */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Forior Space",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "forior.space",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ||
    "Properti pilihan di Jakarta, Tangsel & sekitarnya",
  agentName: process.env.NEXT_PUBLIC_AGENT_NAME || "Forior Space",
  // WhatsApp number in international format without "+" (e.g. 628123456789)
  waNumber: process.env.NEXT_PUBLIC_WA_NUMBER || "6281234567890",
};

export function waLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.waNumber}?text=${text}`;
}
