# Data Model

## market_data
| Field | Type | Notes |
|---|---|---|
| ticker | text pk | e.g. 'US.ARMW' |
| name | text | Human readable e.g. 'ARMW' |
| current_price | numeric | Synced from OpenD |
| status | text | 'active', 'deprecated', 'delisted' |
| superseded_by | text | self-referential fk to ticker |
| last_synced | timestamptz | |
| user_id | uuid | owner-scoping |

## sleeves
| Field | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid | owner-scoping |
| name | text | e.g. 'ARMW' |
| ticker | text | fk to market_data.ticker |
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
- sleeves.ticker → market_data.ticker (many-to-one)
- All tables have `user_id` for RLS owner-scoping.

## RLS Notes
- **User Isolation:** `auth.uid() = user_id` enforced on all tables.
- **Service Role:** The pre-build sync script (`sync_moomoo.ts`) uses the service-role key to bypass RLS when fetching prices and updating the `market_data` table.

## AI Fields
No AI-generated fields in v1. All values are user-entered or deterministically computed.