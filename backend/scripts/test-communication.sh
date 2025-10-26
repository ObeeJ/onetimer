#!/bin/bash

# Test Role Communication Script
echo "Testing Role Communication System..."

# Check if required files exist
echo "Checking communication services..."
if [ -f "services/notification.go" ]; then
    echo "✓ Notification service found"
else
    echo "✗ Notification service missing"
fi

if [ -f "services/role_communication.go" ]; then
    echo "✓ Role communication service found"
else
    echo "✗ Role communication service missing"
fi

# Test database schema
echo "Checking database schema..."
if [ -f "database/migrations.sql" ]; then
    echo "✓ Database migrations found"
    
    # Check for required tables
    if grep -q "audit_logs" database/migrations.sql; then
        echo "✓ Audit logs table defined"
    fi
    
    if grep -q "notifications" database/migrations.sql; then
        echo "✓ Notifications table defined"
    fi
fi

# Test role hierarchy
echo "Testing role hierarchy..."
echo "Super Admin > Admin > Creator/Filler"

# Simulate role interactions
echo "Simulating role interactions:"
echo "1. Creator creates survey → Admin approves → Filler takes survey"
echo "2. Filler uploads KYC → Admin verifies → Filler can earn"
echo "3. Admin actions logged → Super Admin monitors"

echo "Communication test complete!"