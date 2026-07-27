"use client";

import { useState, useTransition } from "react";
import { logDistribution } from "@/lib/actions/distributions";
import { WITHHOLDING_RATE } from "@/lib/types";
import { Plus, Loader2 } from "lucide-react";

export function LogDistributionButton({
  sleeveId,
  sleeveName,
}: {
  sleeveId: string;
  sleeveName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md transition-colors"
        title="Log Distribution"
      >
        <Plus className="h-3 w-3" />
        Dist
      </button>
      {open && (
        <LogDistributionDialog
          sleeveId={sleeveId}
          sleeveName={sleeveName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function LogDistributionDialog({
  sleeveId,
  sleeveName,
  onClose,
}: {
  sleeveId: string;
  sleeveName: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [gross, setGross] = useState("");
  const [error, setError] = useState("");

  const grossNum = Number(gross) || 0;
  const withholding = grossNum * WITHHOLDING_RATE;
  const net = grossNum - withholding;

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await logDistribution(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">
          Log Distribution
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          Record a weekly receipt for <span className="text-white font-medium">{sleeveName}</span>
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="sleeve_id" value={sleeveId} />

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Ex-Date
            </label>
            <input
              type="date"
              name="ex_date"
              defaultValue={today}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Gross Amount (SGD)
            </label>
            <input
              type="number"
              name="gross"
              step="0.01"
              min="0.01"
              required
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              placeholder="1200.00"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {grossNum > 0 && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Withholding (30%)</span>
                <span className="text-red-400 tabular-nums">
                  −SGD {withholding.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-neutral-300">Net</span>
                <span className="text-emerald-400 tabular-nums">
                  SGD {net.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Logging…" : "Log Distribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
