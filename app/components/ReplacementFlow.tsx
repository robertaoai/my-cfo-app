"use client";

import { useState, useTransition } from "react";
import { flagSleeve, executeReplacement } from "@/lib/actions/replacement";
import type { Sleeve } from "@/lib/types";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export function FlagSleeveButton({ sleeve }: { sleeve: Sleeve }) {
  const [open, setOpen] = useState(false);

  if (sleeve.status !== "active") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors"
        title="Flag for Decay"
      >
        <AlertTriangle className="h-3 w-3" />
        Flag
      </button>
      {open && (
        <FlagSleeveDialog sleeve={sleeve} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function FlagSleeveDialog({
  sleeve,
  onClose,
}: {
  sleeve: Sleeve;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [trigger, setTrigger] = useState("below_support_3s");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await flagSleeve(formData);
      if (result.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">
          Flag Sleeve for Decay
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          Flag{" "}
          <span className="text-white font-medium">{sleeve.name}</span> to
          begin the replacement workflow.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="sleeve_id" value={sleeve.id} />

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Decay Trigger
            </label>
            <select
              name="trigger"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="below_support_3s">
                Below support for 3 sessions
              </option>
              <option value="drawdown_gt_15">Drawdown &gt; 15%</option>
            </select>
          </div>

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
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Flagging…" : "Flag Sleeve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReplacementButton({ sleeve }: { sleeve: Sleeve }) {
  const [open, setOpen] = useState(false);

  if (sleeve.status !== "flagged") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-md transition-colors"
        title="Replace Sleeve"
      >
        <ArrowRight className="h-3 w-3" />
        Replace
      </button>
      {open && (
        <ReplacementDialog sleeve={sleeve} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ReplacementDialog({
  sleeve,
  onClose,
}: {
  sleeve: Sleeve;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await executeReplacement(formData);
      if (result.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">
          Replace {sleeve.name}
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          Enter the replacement sleeve details. The current{" "}
          <span className="text-amber-400 font-medium">{sleeve.name}</span>{" "}
          will be marked as &ldquo;replaced&rdquo;.
        </p>

        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="flagged_sleeve_id" value={sleeve.id} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                New Sleeve Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. ARMW-v2"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Role
              </label>
              <select
                name="role"
                defaultValue={sleeve.role}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                name="entry_price"
                step="0.01"
                min="0.01"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Position Size
              </label>
              <input
                type="number"
                name="position_size"
                step="1"
                min="1"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Allocation %
            </label>
            <input
              type="number"
              name="allocation_pct"
              step="0.1"
              min="0"
              max="100"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Support Level
              </label>
              <input
                type="number"
                name="support_level"
                step="0.01"
                placeholder="Optional"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Resistance Level
              </label>
              <input
                type="number"
                name="resistance_level"
                step="0.01"
                placeholder="Optional"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

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
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Replacing…" : "Execute Replacement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
