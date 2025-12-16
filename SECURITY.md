# Security Implementation Guide

## Immediate Actions Required

### 1. Secrets Management

**CRITICAL: Remove credentials from git history**
```bash
# Remove .env from git tracking
git rm --cached .env backend/.env
git rm --cached .env.local .env.production

# Commit the removal
git commit -m "Remove sensitive env files from tracking"

# Add to .gitignore (already done)
```

**Generate new secrets:**
```bash
# Generate new JWT secret
openssl rand -base64 32

# Generate new CSRF secret
openssl rand -hex 32
```

### 2. Environment Variables Setup

**Development (.env):**
- Copy `.env.example` to `.env`
- Fill in real values (NEVER commit)

**Production:**
- Use Render/Vercel environment variables dashboard
- Or use Supabase Edge Functions secrets
- Or use AWS Secrets Manager

### 3. Enable Security Middleware

**In routes.go, add:**
```go
import "onetimer-backend/api/middleware"

// For auth routes
auth.Use(middleware.StrictAuthRateLimit())
auth.Use(middleware.AccountLockout())

// For admin routes
admin.Use(middleware.IPWhitelist())
admin.Use(auditLogger.LogAdminAction())

// For super-admin routes
superAdmin.Use(middleware.IPWhitelist())
superAdmin.Use(auditLogger.LogAdminAction())
```

### 4. Rate Limiting Configuration

**Update .env:**
```env
# Rate limits
RATE_LIMIT_GENERAL=100
RATE_LIMIT_AUTH=10
RATE_LIMIT_ADMIN=50

# IP Whitelist for admin (comma-separated)
ADMIN_IP_WHITELIST=your.office.ip.address,192.168.1.0/24
```

### 5. Audit Logging

**Run migration:**
```sql
-- In Supabase SQL Editor
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    role VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status_code INTEGER,
    duration_ms BIGINT,
    request_body JSONB,
    error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

## Short-Term Improvements

### 6. Request Signing (Optional for API clients)
- Implement HMAC-SHA256 request signing
- Add signature verification middleware

### 7. Session Rotation
- Rotate JWT on role change
- Invalidate old tokens

### 8. 2FA Implementation
- Use TOTP (Time-based One-Time Password)
- Libraries: `github.com/pquerna/otp`

### 9. Account Lockout
- Already implemented in `auth_rate_limit.go`
- 5 failed attempts = 15 min lockout

## Long-Term Security

### 10. CI/CD Security Scanning
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Gosec
        uses: securego/gosec@master
      - name: Run npm audit
        run: npm audit
```

### 11. Penetration Testing
- Schedule quarterly pen tests
- Use tools: OWASP ZAP, Burp Suite

### 12. Bug Bounty
- Start with HackerOne or Bugcrowd
- Minimum payout: $100

### 13. Regular Audits
- Monthly security reviews
- Quarterly dependency updates
- Annual third-party audit

## Security Checklist

- [ ] Remove .env from git
- [ ] Generate new JWT secret
- [ ] Enable strict auth rate limiting
- [ ] Enable account lockout
- [ ] Add IP whitelist for admin
- [ ] Enable audit logging
- [ ] Run audit_logs migration
- [ ] Test rate limiting
- [ ] Test account lockout
- [ ] Review audit logs weekly
- [ ] Set up security alerts
- [ ] Document incident response plan

## Incident Response

**If breach detected:**
1. Immediately rotate all secrets
2. Lock all admin accounts
3. Review audit logs
4. Notify affected users
5. Document incident
6. Implement fixes
7. Post-mortem review

## Contact

Security issues: security@onetimesurvey.xyz
