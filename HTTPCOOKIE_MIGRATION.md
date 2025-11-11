# httpOnly Cookie Migration Guide

## Status: Frontend Ready ✅ | Awaiting Backend Implementation

This document explains the frontend preparation for httpOnly cookie authentication.

---

## What Changed (Frontend Preparation)

### 1. **lib/api-client.ts**
**REMOVED:**
- `private token: string | null` property (line 13)
- Token loading from localStorage in constructor (line 17)
- `setToken()` method (lines 20-24)
- `clearToken()` method (lines 27-31)
- Authorization header logic (lines 45-46)

**ADDED:**
- `credentials: 'include'` in fetch options (line 70)
- Documentation explaining httpOnly cookies (lines 17-30, 56-64)

**WHY:**
- Browser automatically sends httpOnly cookies with `credentials: 'include'`
- No JavaScript access to httpOnly cookies (XSS protection)
- No localStorage token storage (security best practice)

---

### 2. **lib/react-query.tsx**
**REMOVED:**
- `localStorage.removeItem('auth_token')` on 401 error (line 57)

**ADDED:**
- Documentation explaining backend-managed cookie cleanup (lines 56-65)

**WHY:**
- Backend automatically clears the httpOnly cookie on 401/logout
- Browser handles cookie removal (not accessible to JS)
- No manual token cleanup needed

---

### 3. **hooks/use-api.ts**
✅ **Already Ready**
- Already has `credentials: 'include'` (line 30)
- No token management
- Perfect for httpOnly cookies

---

## Evidence of Changes

### Before (Insecure):
```typescript
// lib/api-client.ts (OLD - REMOVED)
private token: string | null = null

constructor() {
  this.token = localStorage.getItem('auth_token') // ❌ Security risk
}

setToken(token: string) {
  localStorage.setItem('auth_token', token) // ❌ XSS vulnerability
}

if (this.token) {
  headers.Authorization = `Bearer ${this.token}` // ❌ Manual management
}
```

### After (Secure):
```typescript
// lib/api-client.ts (NEW - READY)
// ✅ No token property
// ✅ No localStorage usage
// ✅ Browser manages authentication

credentials: 'include' // ✅ Automatic cookie handling
```

---

## Backend Requirements

For this to work, the backend must:

### 1. On Successful Login (`POST /auth/login`)
```
HTTP/1.1 200 OK
Set-Cookie: auth_token=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Path=/
Content-Type: application/json

{
  "user": { ... }
  // ❌ Do NOT include token in JSON response
}
```

### 2. On Logout (`POST /auth/logout`)
```
HTTP/1.1 200 OK
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

### 3. On Unauthorized Request
```
HTTP/1.1 401 Unauthorized
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

---

## How httpOnly Cookies Work

```
Frontend                              Backend
   |                                    |
   |------ POST /auth/login ---------->|
   |      (email, password)             |
   |                                    |
   |<------- Set-Cookie header --------|
   |  (Browser stores automatically)    |
   |                                    |
   |------ GET /profile ------->|
   |  (browser auto-includes    |
   |   httpOnly cookie)         |
   |                            |
   |<------- User Data ---------|
```

### Key Benefits:
1. ✅ **Automatic sending**: Browser includes cookie with every request
2. ✅ **XSS Protection**: JavaScript cannot access the cookie
3. ✅ **CSRF Protection**: `SameSite=Strict` prevents cross-site requests
4. ✅ **No localStorage**: No risk of token theft from storage
5. ✅ **No manual management**: No token copying between files

---

## Checklist for Backend

- [ ] Login endpoint sets `Set-Cookie` header (not in JSON body)
- [ ] Cookie has `HttpOnly` flag
- [ ] Cookie has `Secure` flag (HTTPS only)
- [ ] Cookie has `SameSite=Strict`
- [ ] Logout endpoint clears cookie with `Max-Age=0`
- [ ] 401 response clears cookie automatically
- [ ] Remove token from JSON response body
- [ ] Validate cookie signature on each request

---

## Files Modified

| File | Changes |
|------|---------|
| lib/api-client.ts | Removed token property, setToken(), clearToken(), Authorization header logic |
| lib/react-query.tsx | Removed localStorage.removeItem() on 401 |
| hooks/use-api.ts | Already has credentials: 'include' ✅ |

---

## Testing When Backend is Ready

```bash
# 1. Login with credentials
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -i  # Shows headers including Set-Cookie

# 2. Make authenticated request (cookie sent automatically)
curl -X GET http://localhost:8081/api/v1/users/profile \
  -b "auth_token=..." \  # Browser sends this automatically
  -i

# 3. Logout (cookie cleared)
curl -X POST http://localhost:8081/api/auth/logout \
  -i  # Shows Set-Cookie with Max-Age=0
```

---

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend API client | ✅ Ready | `credentials: 'include'` implemented |
| React Query config | ✅ Ready | No manual token cleanup |
| useApi hook | ✅ Ready | Already has cookie support |
| Error handling | ✅ Ready | useQueryErrorHandler handles 401 |
| **Backend** | ❌ TODO | Must set httpOnly cookies |

---

## References

- [MDN: httpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- [OWASP: Authentication](https://owasp.org/www-community/attacks/Session_hijacking_attack)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)
