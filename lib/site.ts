/** Site-wide config, overridable via environment variables. */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Forior Space",
  // Canonical host (served 200; apex forior.space redirects here).
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "www.forior.space",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ||
    "Properti pilihan di Jakarta, Tangsel & sekitarnya",
  agentName: process.env.NEXT_PUBLIC_AGENT_NAME || "Forior Space",
  // WhatsApp number in international format without "+" (e.g. 628123456789)
  waNumber: process.env.NEXT_PUBLIC_WA_NUMBER || "6281379097488",
};

export function waLink(message: string): string {
  return waLinkWith(site.waNumber, message);
}

/** Normalize a phone input to WhatsApp international digits (e.g. 0813… -> 62813…). */
export function toWaInternational(input: string): string {
  let d = (input || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

/** Display a stored international number in local form (62813… -> 0813…). */
export function toLocalPhone(international: string): string {
  const d = (international || "").replace(/\D/g, "");
  return d.startsWith("62") ? "0" + d.slice(2) : d;
}

export function waLinkWith(number: string, message: string): string {
  return `https://wa.me/${toWaInternational(number)}?text=${encodeURIComponent(message)}`;
}
