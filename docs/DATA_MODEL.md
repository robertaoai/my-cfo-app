# Data Model

## sleeves
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | owner-scoping later |
| name | text | ARMW or AMDW |
| role | text | 'primary' or 'secondary' |
| status | text | 'active', 'flagged', 'replaced', 'closed' |
| entry_price | numeric | |
| position_size | numeric | shares/units |
| allocation_pct | numeric | 10–25 |
| support_level | numeric | |
| resistance_level | numeric | |
| decay_trigger | text | 'none', 'below_support_3s', 'drawdown_gt_15' |
| last_ex_date | date nullable | |
| created_at | timestamptz | |

## distributions
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | |
| sleeve_id | uuid → sleeves | |
| ex_date | date | |
| gross | numeric | ≥ 0, check constraint |
| withholding | numeric | = gross × 0.30 (DB generated column) |
| net | numeric | = gross − withholding (DB generated column) |
| created_at | timestamptz | |

## withdrawals
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | |
| withdrawal_date | date | 1st of month |
| amount | numeric | target 6094.91 |
| principal_before | numeric | snapshot |
| principal_after | numeric | snapshot |
| status | text | 'scheduled', 'executed' |
| created_at | timestamptz | |

## principal_snapshots
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | |
| balance | numeric | market value |
| as_of | timestamptz | |
| note | text | what triggered the snapshot |
| created_at | timestamptz | |

## warnings
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | |
| type | text | 'projected_income_lt_90pct', 'weekly_drawdown_gt_15pct', 'withdrawal_gt_10pct_balance' |
| message | text | human-readable |
| severity | text | 'green', 'amber', 'red' |
| value | numeric | triggering value |
| resolved | boolean | default false |
| created_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid nullable | |
| action | text | e.g. 'distribution_logged', 'withdrawal_executed', 'sleeve_flagged' |
| entity_type | text | |
| entity_id | uuid | |
| metadata | jsonb | payload snapshot |
| created_at | timestamptz | |

## Relationships
- distributions.sleeve_id → sleeves.id (many-to-one)
- All tables have nullable user_id for later RLS owner-scoping

## RLS Notes
- v1: permissive read/write policies (demo-first, no login wall)
- Later: `auth.uid() = user_id` on all tables

## AI Fields
No AI-generated fields in v1. All values are user-entered or deterministically computed.