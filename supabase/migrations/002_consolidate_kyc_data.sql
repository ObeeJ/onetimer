-- Add KYC fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'pending' 
  CHECK (kyc_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS kyc_data JSONB DEFAULT '{}';

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS location VARCHAR(255);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Migrate existing KYC data from fillers table to users table
UPDATE users 
SET kyc_status = fillers.kyc_status 
FROM fillers 
WHERE users.id = fillers.user_id 
AND users.role = 'filler';

-- Create index for KYC queries
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status) 
WHERE kyc_status != 'pending';
