"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "./icons";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/masuk");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600"
    >
      <IconLogout width={16} height={16} /> Keluar
    </button>
  );
}
