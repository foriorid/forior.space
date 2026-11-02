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
    <div className="mx-auto min-h-dvh max-w-md bg-background">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 px-4 backdrop-blur-lg pt-safe">
        <div className="flex h-14 items-center justify-between">
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
      <main className="px-4 py-4 pb-16">{children}</main>
    </div>
  );
}
