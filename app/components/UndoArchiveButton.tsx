"use client";

import { useState } from "react";
import { undoArchive } from "@/lib/actions/archive";
import { useRouter } from "next/navigation";
import { Loader2, ArchiveRestore } from "lucide-react";
import toast from "react-hot-toast";

export function UndoArchiveButton({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleUndo = async () => {
    setIsPending(true);
    const { success, error } = await undoArchive(batchId);
    setIsPending(false);

    if (error) {
      toast.error(error);
    } else if (success) {
      router.refresh();
      toast.success("Archive undone successfully.");
    }
  };

  return (
    <button
      onClick={handleUndo}
      disabled={isPending}
      className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArchiveRestore className="w-4 h-4" />}
      Undo Last Archive
    </button>
  );
}
