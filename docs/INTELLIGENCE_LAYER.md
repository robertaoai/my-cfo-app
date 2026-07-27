# Intelligence Layer

## Messy Inputs
Robert logs distributions manually from moomoo paper account — ex-date, gross amount typed from receipts. Future: paste a brokerage statement for auto-extraction.

## Auto-Structure Schema (v1 — rule-based, no AI)
```json
{
  "sleeve_id": "uuid",
  "ex_date": "2026-09-04",
  "gross": 1200.00,
  "withholding": 360.00,
  "net": 840.00,
  "computed": true,
  "source": "manual_entry",
  "confidence": 1.0
}
```

## Events to Track
- `distribution_logged` — every weekly receipt
- `withdrawal_executed` — monthly 1st
- `sleeve_flagged` — decay trigger fired
- `warning_raised` — threshold breached
- `sleeve_replaced` — replacement trade approved

## Scoring Rules (v1 — deterministic thresholds)
| Rule | Condition | Severity |
|---|---|---|
| Projected income shortfall | Month projected net < 90% of 6,094.91 (i.e. < 5,485.42) | amber |
| Weekly drawdown | Sleeve value drop > 15% week-over-week | red |
| Over-withdrawal | Monthly withdrawal > 10% of remaining principal | red |
| On track | All three thresholds clear | green |

## What Gets Ranked
- Sleeve health: active → flagged → replaced → closed
- Warning priority: red > amber > green
- Cumulative progress: current cumulative ÷ 581,872 target

## v1 vs Later
- **v1:** Rule-based threshold checks on every distribution and withdrawal.
- **Later:** AI anomaly detection on distribution patterns; sleeve decay prediction from price history; auto-suggested replacement candidates.