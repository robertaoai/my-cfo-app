"use client";

import { useState } from "react";
import { archiveCurrentCycle, undoArchive } from "@/lib/actions/archive";
import { Loader2, ArchiveRestore, Archive } from "lucide-react";
import toast from "react-hot-toast";

export function ArchiveCycleButton() {
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
    } else if (success && batchId) {
      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-medium">Cycle Archived Successfully</span>
            <span className="text-xs text-neutral-400">Dashboard has been reset to baseline.</span>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const undoRes = await undoArchive(batchId);
                if (undoRes.error) toast.error(undoRes.error);
                else toast.success("Archive undone.");
              }}
              className="mt-1 px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              <ArchiveRestore className="w-3 h-3" />
              Undo Archive
            </button>
          </div>
        ),
        { duration: 10000 } // Keep open longer so user can undo
      );
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
