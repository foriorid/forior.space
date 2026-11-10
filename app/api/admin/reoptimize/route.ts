import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { hasSupabase, getSupabaseAdmin, IMAGE_BUCKET } from "@/lib/supabase";
import { optimizeImage } from "@/lib/image-server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Process a few per request so the loop never hits the serverless time limit;
// the admin UI calls this repeatedly until `done`.
const BATCH = 6;

/**
 * One-off maintenance: re-compress listing photos already in Storage to WebP,
 * overwriting them in place (same object name, so listing URLs don't change).
 * Idempotent — anything already WebP is skipped, so re-runs are safe and the
 * UI can call it in a loop. Supabase mode only.
 */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Hanya tersedia saat memakai Supabase Storage." },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();
  const { data: objects, error } = await sb.storage
    .from(IMAGE_BUCKET)
    .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Originals still needing conversion (skip folders and already-WebP files).
  const pending = (objects ?? []).filter(
    (o) =>
      o.name &&
      !o.name.endsWith(".webp") &&
      o.metadata?.mimetype &&
      o.metadata.mimetype !== "image/webp",
  );
  const batch = pending.slice(0, BATCH);

  let optimized = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const obj of batch) {
    try {
      const { data: file } = await sb.storage.from(IMAGE_BUCKET).download(obj.name);
      if (!file) {
        skipped++;
        continue;
      }
      const input = Buffer.from(await file.arrayBuffer());
      const { buffer, mime } = await optimizeImage(input, obj.metadata?.mimetype ?? "image/jpeg");
      // Only overwrite when WebP actually came out smaller — never regress.
      if (mime === "image/webp" && buffer.length < input.length) {
        const { error: upErr } = await sb.storage
          .from(IMAGE_BUCKET)
          .upload(obj.name, new Blob([new Uint8Array(buffer)], { type: mime }), {
            upsert: true,
            contentType: mime,
            cacheControl: "3600",
          });
        if (upErr) {
          skipped++;
          continue;
        }
        optimized++;
        savedBytes += input.length - buffer.length;
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({
    total: objects?.length ?? 0,
    processed: batch.length,
    optimized,
    skipped,
    savedBytes,
    done: pending.length <= BATCH,
  });
}
