-- Add current_price to sleeves for manual drawdown tracking (v1)
ALTER TABLE sleeves ADD COLUMN IF NOT EXISTS current_price numeric;

-- Backfill existing sleeves: set current_price = entry_price
UPDATE sleeves SET current_price = entry_price WHERE current_price IS NULL;
