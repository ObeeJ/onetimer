-- Standardize survey table fields to match backend model
ALTER TABLE surveys 
  RENAME COLUMN estimated_time TO estimated_duration;

ALTER TABLE surveys 
  RENAME COLUMN reward TO reward_amount;

ALTER TABLE surveys 
  RENAME COLUMN max_responses TO target_responses;

-- Add missing expires_at column if not exists
ALTER TABLE surveys 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Update indexes
DROP INDEX IF EXISTS idx_surveys_created_at;
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX idx_surveys_status_created ON surveys(status, created_at DESC);
