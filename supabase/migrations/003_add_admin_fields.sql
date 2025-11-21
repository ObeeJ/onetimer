-- Add admin-specific fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS department VARCHAR(100);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- Create admin_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(admin_id, permission, resource)
);

-- Create audit_logs table if not exists (for super admin tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role_department ON users(role, department) 
WHERE role IN ('admin', 'super_admin');

CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
