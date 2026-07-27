-- Sprint 3: Lock Down RLS
-- Run this in the Supabase SQL Editor AFTER deploying the app code.
-- WARNING: After running this, the dashboard will be blank until adopt_data.js is run.

-- 1. Set auth.uid() default on existing user_id columns
ALTER TABLE sleeves ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE distributions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE withdrawals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE principal_snapshots ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE warnings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE audit_logs ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Drop ALL permissive v1 policies
DROP POLICY IF EXISTS "sleeves_v1_read" ON sleeves;
DROP POLICY IF EXISTS "sleeves_v1_write" ON sleeves;
DROP POLICY IF EXISTS "distributions_v1_read" ON distributions;
DROP POLICY IF EXISTS "distributions_v1_write" ON distributions;
DROP POLICY IF EXISTS "withdrawals_v1_read" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_v1_write" ON withdrawals;
DROP POLICY IF EXISTS "principal_snapshots_v1_read" ON principal_snapshots;
DROP POLICY IF EXISTS "principal_snapshots_v1_write" ON principal_snapshots;
DROP POLICY IF EXISTS "warnings_v1_read" ON warnings;
DROP POLICY IF EXISTS "warnings_v1_write" ON warnings;
DROP POLICY IF EXISTS "audit_logs_v1_read" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_v1_write" ON audit_logs;

-- 3. Create auth-scoped policies

-- sleeves
CREATE POLICY "owner_select" ON sleeves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON sleeves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON sleeves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON sleeves FOR DELETE USING (auth.uid() = user_id);

-- distributions
CREATE POLICY "owner_select" ON distributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON distributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON distributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON distributions FOR DELETE USING (auth.uid() = user_id);

-- withdrawals
CREATE POLICY "owner_select" ON withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON withdrawals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON withdrawals FOR DELETE USING (auth.uid() = user_id);

-- principal_snapshots
CREATE POLICY "owner_select" ON principal_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON principal_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON principal_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON principal_snapshots FOR DELETE USING (auth.uid() = user_id);

-- warnings
CREATE POLICY "owner_select" ON warnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON warnings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON warnings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON warnings FOR DELETE USING (auth.uid() = user_id);

-- audit_logs
CREATE POLICY "owner_select" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON audit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON audit_logs FOR DELETE USING (auth.uid() = user_id);
