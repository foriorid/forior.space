import sharp from "sharp";

/**
 * Shrink a listing photo for fast loading on slow connections: auto-orient
 * (phone EXIF), cap the long edge at 1920px, re-encode to WebP. A 4–8MB phone
 * photo becomes ~150–400KB. Returns the original untouched on any decode error
 * (e.g. an unsupported format) so callers never hard-fail.
 */
export async function optimizeImage(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string }> {
  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    return { buffer: out, mime: "image/webp" };
  } catch {
    return { buffer, mime };
  }
}
