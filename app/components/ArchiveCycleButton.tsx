"use client";

import { useState } from "react";
import { archiveCurrentCycle, undoArchive } from "@/lib/actions/archive";
import { useRouter } from "next/navigation";
import { Loader2, ArchiveRestore, Archive } from "lucide-react";
import toast from "react-hot-toast";

export function ArchiveCycleButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive the current cycle? This sets a new baseline for the dashboard.")) {
      return;
    }

    setIsPending(true);
    const { success, error, batchId } = await archiveCurrentCycle();
    setIsPending(false);

    if (error) {
      toast.error(error);
      router.refresh(); // Dynamically update dashboard
      toast.success("Cycle Archived Successfully");
    }
  };

  return (
    <button
      onClick={handleArchive}
      disabled={isPending}
      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50 flex items-center gap-2"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
      Archive Cycle
    </button>
  );
}
