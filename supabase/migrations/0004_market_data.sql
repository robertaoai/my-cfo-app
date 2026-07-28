-- Phase 1: market_data and ticker lifecycle

-- 1. Create the market_data table
CREATE TABLE market_data (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_price NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'delisted')),
  superseded_by TEXT REFERENCES market_data(ticker),
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- 2. Add ticker column to sleeves
ALTER TABLE sleeves ADD COLUMN ticker TEXT REFERENCES market_data(ticker);

-- 3. Enable RLS
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for market_data
CREATE POLICY "Users can view their own market data"
  ON market_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own market data"
  ON market_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own market data"
  ON market_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own market data"
  ON market_data FOR DELETE
  USING (auth.uid() = user_id);

-- Note: The service_role key will bypass RLS during the pre-build sync, 
-- allowing it to upsert rows globally.
