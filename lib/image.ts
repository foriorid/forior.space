// Client-side image compression: resize + re-encode as JPEG before upload.
// Keeps requests small, speeds uploads, and sidesteps iPhone HEIC issues.
// Falls back to the original file if anything fails.

type Drawable = ImageBitmap | HTMLImageElement;

async function decodeImage(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    } catch {
      /* fall back to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("decode failed"));
      im.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  try {
    const img = await decodeImage(file);
    const w0 = "naturalWidth" in img ? img.naturalWidth : img.width;
    const h0 = "naturalHeight" in img ? img.naturalHeight : img.height;
    const scale = Math.min(1, maxDim / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img as CanvasImageSource, 0, 0, w, h);
    if ("close" in img && typeof img.close === "function") img.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (!blob) throw new Error("toBlob returned null");
    return blob;
  } catch (err) {
    console.warn("[compressImage] using original file:", err);
    return file;
  }
}
