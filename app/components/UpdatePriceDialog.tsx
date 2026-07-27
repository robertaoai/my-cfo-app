"use client";

import { useState, useTransition } from "react";
import { updateSleevePrice } from "@/lib/actions/sleeves";
import { DollarSign, Loader2 } from "lucide-react";

export function UpdatePriceButton({
  sleeveId,
  sleeveName,
  currentPrice,
}: {
  sleeveId: string;
  sleeveName: string;
  currentPrice: number | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors"
        title="Update Price"
      >
        <DollarSign className="h-3 w-3" />
        Price
      </button>
      {open && (
        <UpdatePriceDialog
          sleeveId={sleeveId}
          sleeveName={sleeveName}
          currentPrice={currentPrice}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function UpdatePriceDialog({
  sleeveId,
  sleeveName,
  currentPrice,
  onClose,
}: {
  sleeveId: string;
  sleeveName: string;
  currentPrice: number | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [price, setPrice] = useState(currentPrice?.toString() ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateSleevePrice(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">Update Price</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Enter the latest market price for{" "}
          <span className="text-white font-medium">{sleeveName}</span>
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={sleeveId} />

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Current Market Price (SGD)
            </label>
            <input
              type="number"
              name="current_price"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
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
              {isPending ? "Saving…" : "Update Price"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
