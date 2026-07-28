"use client";

import { useState, useTransition } from "react";
import { createSleeve, updateSleeve } from "@/lib/actions/sleeves";
import type { Sleeve } from "@/lib/types";
import { Plus, Pencil, Loader2 } from "lucide-react";

export function SleeveActions({
  mode,
  sleeve,
  availableTickers,
}: {
  mode: "create" | "edit";
  sleeve?: Sleeve;
  availableTickers: { ticker: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (mode === "create") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Sleeve
        </button>
        {open && <SleeveFormDialog onClose={() => setOpen(false)} availableTickers={availableTickers} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-300 hover:bg-white/5 rounded-md transition-colors"
        title="Edit Sleeve"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {open && (
        <SleeveFormDialog sleeve={sleeve} onClose={() => setOpen(false)} availableTickers={availableTickers} />
      )}
    </>
  );
}

function SleeveFormDialog({
  sleeve,
  onClose,
  availableTickers,
}: {
  sleeve?: Sleeve;
  onClose: () => void;
  availableTickers: { ticker: string; name: string }[];
}) {
  const isEdit = !!sleeve;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const action = isEdit ? updateSleeve : createSleeve;
      const result = await action(formData);
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
        <h2 className="text-lg font-semibold text-white mb-4">
          {isEdit ? "Edit Sleeve" : "Create Sleeve"}
        </h2>

        <form action={handleSubmit} className="space-y-3">
          {isEdit && <input type="hidden" name="id" value={sleeve!.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Name (Ticker)
              </label>
              <select
                name="name"
                defaultValue={sleeve?.name ?? ""}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="" disabled>Select a ticker</option>
                {availableTickers.map((t) => (
                  <option key={t.ticker} value={t.ticker}>
                    {t.ticker} ({t.name})
                  </option>
                ))}
                {/* Always allow the existing sleeve name just in case it's missing or deprecated */}
                {sleeve && !availableTickers.find((t) => t.ticker === sleeve.name) && (
                  <option value={sleeve.name}>{sleeve.name} (Legacy)</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Role
              </label>
              <select
                name="role"
                defaultValue={sleeve?.role ?? "primary"}
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
                defaultValue={sleeve?.entry_price ?? ""}
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
                defaultValue={sleeve?.position_size ?? ""}
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
              defaultValue={sleeve?.allocation_pct ?? ""}
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
                defaultValue={sleeve?.support_level ?? ""}
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
                defaultValue={sleeve?.resistance_level ?? ""}
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
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending
                ? "Saving…"
                : isEdit
                ? "Save Changes"
                : "Create Sleeve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
