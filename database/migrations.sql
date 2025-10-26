-- Add notifications table to existing schema
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Update audit_logs table to include more details
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add role communication tracking table
CREATE TABLE IF NOT EXISTS role_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_user_id UUID NOT NULL REFERENCES users(id),
    target_user_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Add indexes for role communications
CREATE INDEX IF NOT EXISTS idx_role_communications_source ON role_communications(source_user_id);
CREATE INDEX IF NOT EXISTS idx_role_communications_target ON role_communications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_communications_status ON role_communications(status);

-- Add workflow status tracking
CREATE TABLE IF NOT EXISTS workflow_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    status VARCHAR(100) NOT NULL,
    previous_status VARCHAR(100),
    changed_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- Add indexes for workflow status
CREATE INDEX IF NOT EXISTS idx_workflow_status_entity ON workflow_status(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status_status ON workflow_status(status);
CREATE INDEX IF NOT EXISTS idx_workflow_status_changed_by ON workflow_status(changed_by);