import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { getSettings, updateSettings } from "@/lib/store";
import { toWaInternational } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, string> = {};

  if (typeof body.agentName === "string" && body.agentName.trim()) {
    patch.agentName = body.agentName.trim();
  }
  if (typeof body.waNumber === "string") {
    const normalized = toWaInternational(body.waNumber);
    if (normalized.length < 8) {
      return NextResponse.json({ error: "Nomor WhatsApp tidak valid" }, { status: 400 });
    }
    patch.waNumber = normalized;
  }

  const settings = await updateSettings(patch);
  revalidateTag("settings");
  return NextResponse.json({ settings });
}
