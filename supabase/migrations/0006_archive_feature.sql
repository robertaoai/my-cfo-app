-- Add archive_batch_id to distributions
ALTER TABLE distributions ADD COLUMN archive_batch_id UUID NULL;

-- Create an index to speed up filtering on unarchived distributions
CREATE INDEX IF NOT EXISTS idx_distributions_archive_batch_id ON distributions(archive_batch_id);

-- Update the types file in the application (this is a reminder that we will need to re-run typegen)
