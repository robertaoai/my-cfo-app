-- Fix RLS policy to allow users to view global market data (where user_id is null)
DROP POLICY IF EXISTS "Users can view their own market data" ON market_data;

CREATE POLICY "Users can view market data"
  ON market_data FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
