"use client";

import { logout } from "@/lib/actions/auth";
import { LogOut, User } from "lucide-react";
import { useTransition } from "react";

export function UserMenu({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{email}</span>
      </div>
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
      >
        <LogOut className="h-3 w-3" />
        {isPending ? "Signing out…" : "Sign Out"}
      </button>
    </div>
  );
}
