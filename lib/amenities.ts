export type AmenityIconKey =
  | "pool"
  | "gym"
  | "run"
  | "shield"
  | "wifi"
  | "car"
  | "tree"
  | "mall"
  | "lift"
  | "building"
  | "default";

/** Guess an icon for a free-text amenity label. */
export function amenityIconKey(name: string): AmenityIconKey {
  const s = name.toLowerCase();
  if (/kolam\s*renang|swimming|\bpool\b|berenang|renang/.test(s)) return "pool";
  if (/gym|fitness|kebugaran|fitnes/.test(s)) return "gym";
  if (/jogging|lari|running|track|\brun\b|sepeda|cycling/.test(s)) return "run";
  if (/keamanan|security|cctv|24\s*jam|satpam|one\s*gate|akses kartu|access card/.test(s))
    return "shield";
  if (/wifi|wi-fi|internet|fiber/.test(s)) return "wifi";
  if (/parkir|basement|carport|garasi|parking|valet/.test(s)) return "car";
  if (/taman|garden|green|roof\s*garden|sky\s*garden|playground|bbq/.test(s))
    return "tree";
  if (/mall|retail|shopping|belanja|minimarket|supermarket|tenant|f&b|resto|cafe|kafe/.test(s))
    return "mall";
  if (/lift|elevator/.test(s)) return "lift";
  if (/lobby|lobi|ballroom|function|co-?working|business|meeting|sauna|spa|club\s*house|clubhouse|concierge/.test(s))
    return "building";
  return "default";
}
