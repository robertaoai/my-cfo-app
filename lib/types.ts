// ── Core domain types mirroring the Supabase schema ──

export type SleeveRole = "primary" | "secondary";
export type SleeveStatus = "active" | "flagged" | "replaced" | "closed";
export type DecayTrigger = "none" | "below_support_3s" | "drawdown_gt_15";

export interface Sleeve {
  id: string;
  user_id: string | null;
  name: string;
  ticker: string | null;
  role: SleeveRole;
  status: SleeveStatus;
  entry_price: number;
  position_size: number;
  allocation_pct: number;
  support_level: number | null;
  resistance_level: number | null;
  current_price: number | null;
  decay_trigger: DecayTrigger;
  last_ex_date: string | null;
  created_at: string;
  market_data?: {
    status: string;
    superseded_by?: string | null;
  };
}

export interface Distribution {
  id: string;
  user_id: string;
  sleeve_id: string;
  ex_date: string;
  gross: number;
  withholding: number; // DB generated: gross × 0.30
  net: number; // DB generated: gross − withholding
  archive_batch_id: string | null;
  created_at: string;
}

export interface DistributionWithSleeve extends Distribution {
  sleeve_name: string;
}

export type WithdrawalStatus = "scheduled" | "executed";

export interface Withdrawal {
  id: string;
  user_id: string | null;
  withdrawal_date: string;
  amount: number;
  principal_before: number;
  principal_after: number;
  status: WithdrawalStatus;
  created_at: string;
}

export interface PrincipalSnapshot {
  id: string;
  user_id: string | null;
  balance: number;
  as_of: string;
  note: string | null;
  created_at: string;
}

export type WarningSeverity = "green" | "amber" | "red";
export type WarningType =
  | "projected_income_lt_90pct"
  | "weekly_drawdown_gt_15pct"
  | "withdrawal_gt_10pct_balance";

export interface Warning {
  id: string;
  user_id: string | null;
  type: WarningType;
  message: string;
  severity: WarningSeverity;
  value: number | null;
  resolved: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Constants ──

export const TARGET_MONTHLY_NET = 6094.91;
export const TARGET_CUMULATIVE = 581872;
export const WITHHOLDING_RATE = 0.3;
export const WARNING_INCOME_THRESHOLD = 0.9; // 90%
export const WARNING_DRAWDOWN_THRESHOLD = 0.15; // 15%
export const WARNING_WITHDRAWAL_THRESHOLD = 0.1; // 10%
