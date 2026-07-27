"use client";

import { useState, useTransition } from "react";
import { simulateWithdrawal } from "@/lib/actions/withdrawals";
import { TARGET_MONTHLY_NET } from "@/lib/types";
import { ArrowDownCircle, Loader2 } from "lucide-react";

export function SimulateWithdrawalButton({
  currentPrincipal,
}: {
  currentPrincipal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 rounded-lg transition-colors"
      >
        <ArrowDownCircle className="h-4 w-4" />
        Simulate Withdrawal
      </button>
      {open && (
        <SimulateWithdrawalDialog
          currentPrincipal={currentPrincipal}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SimulateWithdrawalDialog({
  currentPrincipal,
  onClose,
}: {
  currentPrincipal: number;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(TARGET_MONTHLY_NET.toString());
  const [error, setError] = useState("");

  const amountNum = Number(amount) || 0;
  const principalAfter = currentPrincipal - amountNum;
  const isOverWithdrawal = amountNum > currentPrincipal;

  // Default date: 1st of next month
  const now = new Date();
  const nextFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultDate = nextFirst.toISOString().split("T")[0];

  function formatSGD(n: number) {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 2,
    }).format(n);
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await simulateWithdrawal(formData);
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
          Simulate Monthly Withdrawal
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          Deduct from principal to simulate your monthly living expense
          extraction.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Withdrawal Date
            </label>
            <input
              type="date"
              name="withdrawal_date"
              defaultValue={defaultDate}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Amount (SGD)
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Target: {formatSGD(TARGET_MONTHLY_NET)}/month
            </p>
          </div>

          {amountNum > 0 && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Principal Before</span>
                <span className="text-white tabular-nums">
                  {formatSGD(currentPrincipal)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Withdrawal</span>
                <span className="text-red-400 tabular-nums">
                  −{formatSGD(amountNum)}
                </span>
              </div>
              <hr className="border-white/10" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-neutral-300">Principal After</span>
                <span
                  className={`tabular-nums ${
                    isOverWithdrawal ? "text-red-400" : "text-white"
                  }`}
                >
                  {formatSGD(principalAfter)}
                </span>
              </div>
              {isOverWithdrawal && (
                <p className="text-xs text-red-400">
                  ⚠ Withdrawal exceeds current principal.
                </p>
              )}
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
              disabled={isPending || isOverWithdrawal}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Processing…" : "Execute Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
