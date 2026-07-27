-- Income-First Engine: core schema (demo-first, no login wall)

create extension if not exists pgcrypto;

-- sleeves
create table if not exists sleeves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  role text not null check (role in ('primary','secondary')),
  status text not null default 'active' check (status in ('active','flagged','replaced','closed')),
  entry_price numeric not null,
  position_size numeric not null,
  allocation_pct numeric not null check (allocation_pct between 0 and 100),
  support_level numeric,
  resistance_level numeric,
  decay_trigger text not null default 'none' check (decay_trigger in ('none','below_support_3s','drawdown_gt_15')),
  last_ex_date date,
  created_at timestamptz not null default now()
);
alter table sleeves enable row level security;
drop policy if exists "sleeves_v1_read" on sleeves;
create policy "sleeves_v1_read" on sleeves for select using (true);
drop policy if exists "sleeves_v1_write" on sleeves;
create policy "sleeves_v1_write" on sleeves for all using (true) with check (true);

-- distributions
create table if not exists distributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  sleeve_id uuid not null references sleeves(id),
  ex_date date not null,
  gross numeric not null check (gross >= 0),
  withholding numeric generated always as (gross * 0.30) stored,
  net numeric generated always as (gross - (gross * 0.30)) stored,
  created_at timestamptz not null default now()
);
alter table distributions enable row level security;
drop policy if exists "distributions_v1_read" on distributions;
create policy "distributions_v1_read" on distributions for select using (true);
drop policy if exists "distributions_v1_write" on distributions;
create policy "distributions_v1_write" on distributions for all using (true) with check (true);

-- withdrawals
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  withdrawal_date date not null,
  amount numeric not null check (amount >= 0),
  principal_before numeric not null,
  principal_after numeric not null,
  status text not null default 'scheduled' check (status in ('scheduled','executed')),
  created_at timestamptz not null default now()
);
alter table withdrawals enable row level security;
drop policy if exists "withdrawals_v1_read" on withdrawals;
create policy "withdrawals_v1_read" on withdrawals for select using (true);
drop policy if exists "withdrawals_v1_write" on withdrawals;
create policy "withdrawals_v1_write" on withdrawals for all using (true) with check (true);

-- principal_snapshots
create table if not exists principal_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  balance numeric not null,
  as_of timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);
alter table principal_snapshots enable row level security;
drop policy if exists "principal_snapshots_v1_read" on principal_snapshots;
create policy "principal_snapshots_v1_read" on principal_snapshots for select using (true);
drop policy if exists "principal_snapshots_v1_write" on principal_snapshots;
create policy "principal_snapshots_v1_write" on principal_snapshots for all using (true) with check (true);

-- warnings
create table if not exists warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null check (type in ('projected_income_lt_90pct','weekly_drawdown_gt_15pct','withdrawal_gt_10pct_balance')),
  message text not null,
  severity text not null default 'green' check (severity in ('green','amber','red')),
  value numeric,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table warnings enable row level security;
drop policy if exists "warnings_v1_read" on warnings;
create policy "warnings_v1_read" on warnings for select using (true);
drop policy if exists "warnings_v1_write" on warnings;
create policy "warnings_v1_write" on warnings for all using (true) with check (true);

-- audit_logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

-- seed: principal snapshot
insert into principal_snapshots (balance, as_of, note)
select 330000.00, '2026-07-27T00:00:00Z', 'Initial seed capital'
where not exists (select 1 from principal_snapshots limit 1);

-- seed: sleeves
insert into sleeves (name, role, status, entry_price, position_size, allocation_pct, support_level, resistance_level, decay_trigger, last_ex_date)
values
  ('ARMW', 'primary', 'active', 52.30, 7900, 12.5, 50.10, 56.80, 'none', '2026-08-25'),
  ('AMDW', 'secondary', 'active', 118.40, 2800, 10.0, 112.50, 128.00, 'none', '2026-08-25')
on conflict do nothing;

-- seed: distributions (first 4 weeks of distribution window)
insert into distributions (sleeve_id, ex_date, gross)
select s.id, d.ex_date, d.gross
  from sleeves s
  cross join (values
    ('ARMW','2026-09-04'::date, 1250.00),
    ('ARMW','2026-09-11'::date, 1180.00),
    ('AMDW','2026-09-04'::date, 900.00),
    ('AMDW','2026-09-18'::date, 920.00)
  ) as d(name, ex_date, gross)
  where s.name = d.name;

-- seed: audit logs
insert into audit_logs (action, entity_type, entity_id, metadata)
values
  ('principal_seeded', 'principal_snapshots', gen_random_uuid(), '{"balance": 330000, "note": "Initial seed capital"}'),
  ('sleeve_created', 'sleeves', gen_random_uuid(), '{"name": "ARMW", "role": "primary"}'),
  ('sleeve_created', 'sleeves', gen_random_uuid(), '{"name": "AMDW", "role": "secondary"}'),
  ('distribution_logged', 'distributions', gen_random_uuid(), '{"sleeve": "ARMW", "ex_date": "2026-09-04", "gross": 1250, "net": 875}'),
  ('distribution_logged', 'distributions', gen_random_uuid(), '{"sleeve": "AMDW", "ex_date": "2026-09-04", "gross": 900, "net": 630}')
on conflict do nothing;

-- seed: warnings
insert into warnings (type, message, severity, value, resolved)
values
  ('projected_income_lt_90pct', 'Projected monthly net SGD 1,505 is below 90% of target SGD 6,094.91 (SGD 5,485.42)', 'amber', 1505.00, false)
on conflict do nothing;