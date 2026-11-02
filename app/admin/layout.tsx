import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/guard";
import { LogoutButton } from "@/components/LogoutButton";
import { IconEye } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) redirect("/masuk?next=/admin");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md md:max-w-3xl lg:max-w-4xl">
      <header className="sticky top-0 z-30 px-4 pt-safe md:px-6">
        <div className="glass mt-3 flex h-14 items-center justify-between rounded-2xl px-3">
          <span className="text-lg font-extrabold">Dashboard Agen</span>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)]"
            >
              <IconEye width={16} height={16} /> Situs
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="px-4 py-4 pb-16 md:px-6">{children}</main>
    </div>
  );
}
