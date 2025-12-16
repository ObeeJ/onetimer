# 🔒 Secrets Setup Guide

## ✅ Completed Actions

1. ✅ Removed `.env.production` from git tracking
2. ✅ Updated `.gitignore` to block all env files
3. ✅ Generated new secrets (see below)

## 🔑 New Secrets Generated

**IMPORTANT: Use these NEW secrets, not the old ones!**

### New JWT Secret:
```
N5AFOxgDMjdlUI4m5mR09183sZiigbPmfm5zAQ6AUbw=
```

### New CSRF Secret:
```
fa97ce1bb0998a1fe8afcb2dae24f9576f3fd799cd4ed10fd3dabba3cdc75cb3
```

## 📝 Next Steps

### 1. Update Local .env Files

**Update `/home/obeej/Desktop/onetimer/.env`:**
```bash
# Replace the JWT_SECRET line with:
JWT_SECRET=N5AFOxgDMjdlUI4m5mR09183sZiigbPmfm5zAQ6AUbw=

# Add CSRF secret:
CSRF_SECRET=fa97ce1bb0998a1fe8afcb2dae24f9576f3fd799cd4ed10fd3dabba3cdc75cb3
```

**Update `/home/obeej/Desktop/onetimer/backend/.env`:**
```bash
# Replace the JWT_SECRET line with:
JWT_SECRET=N5AFOxgDMjdlUI4m5mR09183sZiigbPmfm5zAQ6AUbw=
```

### 2. Update Production Environment Variables

**On Render.com (or your hosting platform):**

1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Update these variables:
   - `JWT_SECRET` = `N5AFOxgDMjdlUI4m5mR09183sZiigbPmfm5zAQ6AUbw=`
   - `CSRF_SECRET` = `fa97ce1bb0998a1fe8afcb2dae24f9576f3fd799cd4ed10fd3dabba3cdc75cb3`
4. Redeploy the service

### 3. Invalidate All Existing Sessions

**IMPORTANT:** After changing JWT_SECRET, all existing user sessions will be invalid.
Users will need to log in again. This is a security feature!

### 4. Restart Services

```bash
# Restart backend
cd /home/obeej/Desktop/onetimer
npm run backend:dev

# Restart frontend (in another terminal)
npm run dev
```

### 5. Test Login

1. Clear browser cookies
2. Try logging in with: obaney2000@gmail.com / Obaney2000!
3. Verify new JWT token is generated

## 🛡️ Security Best Practices

### DO:
- ✅ Store secrets in environment variables
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets every 90 days
- ✅ Use secrets manager (AWS Secrets Manager, HashiCorp Vault)
- ✅ Monitor for leaked secrets (GitHub secret scanning)

### DON'T:
- ❌ Commit .env files to git
- ❌ Share secrets via email/Slack
- ❌ Use same secrets across environments
- ❌ Hardcode secrets in code
- ❌ Store secrets in plain text files

## 🚨 If Secrets Are Compromised

1. **Immediately** generate new secrets:
   ```bash
   openssl rand -base64 32  # New JWT
   openssl rand -hex 32     # New CSRF
   ```

2. Update all environments

3. Force logout all users

4. Review audit logs for suspicious activity

5. Notify security team

## 📊 Secrets Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Rotation |
|--------|-------------------|--------------|---------------|
| JWT_SECRET | 90 days | Today | +90 days |
| CSRF_SECRET | 90 days | Today | +90 days |
| Database Password | 180 days | Check Supabase | - |
| API Keys | 90 days | Check providers | - |

## 🔐 Additional Security Measures

1. **Enable 2FA** for all admin accounts
2. **Set up alerts** for failed login attempts
3. **Review audit logs** weekly
4. **Run security scans** monthly
5. **Update dependencies** quarterly

## ✅ Security Checklist

- [x] Remove .env from git
- [x] Generate new JWT secret
- [x] Generate new CSRF secret
- [ ] Update local .env files
- [ ] Update production env vars
- [ ] Restart all services
- [ ] Test login functionality
- [ ] Enable audit logging
- [ ] Set up IP whitelist
- [ ] Enable rate limiting
- [ ] Document incident response

## 📞 Support

Questions? Check SECURITY.md or contact your security team.

---
**Generated:** $(date)
**Status:** 🔴 ACTION REQUIRED - Update secrets in all environments
