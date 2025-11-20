# Registration & Validation Audit Report

**Date:** November 12, 2025
**Status:** Critical Issues Identified - No Stone Unturned
**Severity:** HIGH - Multiple field mismatches causing 400 errors

---

## Executive Summary

Investigation revealed **5 critical issues** preventing user registration and demographic updates:
1. **Filler onboarding** calling wrong endpoint (`/user/register` instead of `/onboarding/filler`)
2. **Filler settings** using wrong HTTP method (POST instead of PUT)
3. **Password validation mismatch** - frontend accepts 8 chars, backend requires special character
4. **Creator registration** not implemented - no backend endpoint exists
5. **CORS header** empty in response - access control not configured

---

## Issue #1: Filler Onboarding Calling Wrong Endpoint

### Evidence
**File:** [app/filler/onboarding/page.tsx:147](app/filler/onboarding/page.tsx#L147)
```typescript
const registrationData = {
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: formData.email,
  password: formData.password,
  role: "filler",
  profile: { // Demographics data
    age_range: formData.age,
    gender: formData.gender,
    country: formData.country,
    state: formData.state,
    education: formData.education,
    employment: formData.employment,
    income_range: formData.income,
    interests: formData.interests,
  },
};

await api.post('/user/register', registrationData);  // ❌ WRONG ENDPOINT
```

### Problem

**Frontend is sending:**
- `first_name`, `last_name`, `email`, `password`, `role`, `profile` object

**Endpoint `/user/register` expects** [backend/api/controllers/user.controller.go:30-36](backend/api/controllers/user.controller.go#L30-L36):
- `email`, `name` (single field), `role`, `password`, `phone`

**No `profile` field accepted!**

### Correct Endpoint

**Should call:** `POST /onboarding/filler`
**Expected by:** [backend/api/controllers/onboarding.controller.go:26-42](backend/api/controllers/onboarding.controller.go#L26-L42)

**Correct endpoint accepts:**
- `first_name`, `last_name`, `email`, `password`, `profile` object ✅
- Stores data in both `users` table AND `user_profiles` table
- Creates referral code automatically
- Returns full user object with referral code

### Error You're Seeing

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

**Reason:** Backend validator expects `name` field, but frontend sends `first_name` and `last_name`.

---

## Issue #2: Filler Settings Using Wrong HTTP Method

### Evidence
**File:** [app/filler/settings/page.tsx:154](app/filler/settings/page.tsx#L154)
```typescript
await api.post('/onboarding/demographics', demographicsData)  // ❌ POST
```

**Backend route** [backend/api/routes/routes.go:188](backend/api/routes/routes.go#L188):
```go
onboarding.Put("/demographics", onboardingController.UpdateDemographics)  // ✅ PUT
```

### Problem
- Frontend uses **POST**
- Backend expects **PUT**
- This causes Method Not Allowed (405) error

### Solution
Change to: `await api.put('/onboarding/demographics', demographicsData)`

---

## Issue #3: Password Validation Mismatch

### Frontend Validation
**File:** [app/filler/onboarding/page.tsx:75-88](app/filler/onboarding/page.tsx#L75-L88)

```typescript
const validate = (name: string, value: string) => {
  switch (name) {
    case 'password':
      if (value.length < 8) error = 'Must be at least 8 characters long.';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value))
        error = 'Must include uppercase, lowercase, and a number.';  // ❌ MISSING SPECIAL CHAR CHECK
      break;
  }
}
```

**What frontend allows:**
- ✅ `Password123` (8+ chars, upper, lower, digit) - NO SPECIAL CHAR

### Backend Validation
**File:** [backend/security/validator.go:58-88](backend/security/validator.go#L58-L88)

```go
func (v *Validator) ValidatePassword(password string) *Validator {
  if len(password) < 8 { ... }

  var hasUpper, hasLower, hasDigit, hasSpecial bool
  for _, char := range password {
    switch {
    case unicode.IsUpper(char): hasUpper = true
    case unicode.IsLower(char): hasLower = true
    case unicode.IsDigit(char): hasDigit = true
    case unicode.IsPunct(char) || unicode.IsSymbol(char): hasSpecial = true
    }
  }

  if !hasUpper || !hasLower || !hasDigit || !hasSpecial {  // ❌ ALL 4 REQUIRED
    v.errors = append(v.errors, ValidationError{
      "password",
      "Password must contain uppercase, lowercase, digit, and special character"
    })
  }
}
```

**What backend requires:**
- ✅ Uppercase
- ✅ Lowercase
- ✅ Digit
- ✅ Special character (!, @, #, $, %, etc.)

### Example Failures

| Password | Frontend | Backend | Result |
|----------|----------|---------|--------|
| `Pass123` | ✅ Pass | ❌ Fail | **400 Error** - no special char |
| `Pass123!` | ✅ Pass | ✅ Pass | **201 Created** ✅ |
| `Obaney2000@ ` | ✅ Pass | ⚠️ Fail | Trailing space causes issues |

### The User's Actual Password
You provided: `"password": "Obaney2000@ "`
- Has trailing space: `@ `
- This passes frontend validation but backend validator may have issues with whitespace

---

## Issue #4: No Creator Registration Backend Endpoint

### Evidence

**Frontend:** [app/creator/onboarding/page.tsx:174-189](app/creator/onboarding/page.tsx#L174-L189)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    // Sign in the user  - NO REGISTRATION CALL!
    await signIn(formData.email, formData.password)
    router.push("/creator")
  } catch (error) {
    console.error("Registration failed:", error)
  } finally {
    setIsLoading(false)
  }
}
```

**Collects:**
- firstName, lastName, email, password, userType, organization, jobTitle, industry, role, phone, description, goals, sources
- **But never sends any of this to the backend!**

### Backend Routes Available

**File:** [backend/api/routes/routes.go](backend/api/routes/routes.go)
- Line 90: ✅ `/user/register` - generic registration
- Line 187: ✅ `/onboarding/filler` - filler-specific onboarding
- **Missing:** No `/onboarding/creator` endpoint exists!

### Problem

1. Creator onboarding form doesn't call any API
2. No creator-specific registration endpoint exists
3. If creator uses `/user/register`, they'll get "name field required" error
4. Creator registration flow is **completely non-functional**

---

## Issue #5: CORS Configuration Missing

### Evidence from Your Network Request

```
Response Headers:
access-control-allow-origin:     ← EMPTY! Should be https://www.onetimesurvey.xyz
content-encoding: br             ← Response is Brotli compressed
content-type: application/json
```

### Problem

- Header exists but has no value
- Frontend at `https://www.onetimesurvey.xyz` can't read response (CORS violation)
- Browser may block the error response

### Backend CORS Status

Need to verify backend's CORS configuration. This is likely in main backend startup file.

---

## Field Mapping Summary

| Flow | Frontend Sends | Backend Endpoint | Backend Expects | Status |
|------|---|---|---|---|
| **Filler Onboarding** | first_name, last_name, email, password, profile | `/user/register` | name, email, password, role, phone | ❌ MISMATCH |
| **Filler Onboarding (Correct)** | first_name, last_name, email, password, profile | `/onboarding/filler` | first_name, last_name, email, password, profile | ✅ MATCH |
| **Filler Demographics** | age_range, gender, etc. | POST `/onboarding/demographics` | (PUT method) | ❌ WRONG METHOD |
| **Creator Onboarding** | firstName, lastName, email, password, etc. | (No API call) | (No endpoint exists) | ❌ NOT IMPLEMENTED |

---

## Validation Rules Comparison

### Email Validation
| Layer | Rule | Status |
|-------|------|--------|
| Frontend | Basic regex `/\S+@\S+\.\S+/` | ✅ Basic |
| Backend | RFC 5322 + Regex `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | ✅ Strict |

**Issue:** If frontend allows email that backend rejects → 400 error

### Name Validation
| Layer | Rule | Status |
|-------|------|--------|
| Frontend | ≥ 2 characters | ✅ |
| Backend (Filler) | NOT APPLICABLE (merged to single name) | - |
| Backend (/user/register) | 2-100 chars, only `[a-zA-Z\s'-]` | ✅ |

**Issue:** If name has numbers or special chars → validation fails

### Password Validation
| Layer | Rules | Status |
|-------|-------|--------|
| Frontend | 8+ chars, [a-z], [A-Z], [0-9] | ⚠️ Incomplete |
| Backend | 8+ chars, [a-z], [A-Z], [0-9], **special char** | ✅ Complete |

**Issue:** Frontend missing special character requirement!

---

## User Experience Error Handling

### Current State
When 400 error occurs, user sees:
```
"Error": "Registration failed"
```

**Very unfriendly!** User doesn't know:
- Which field is wrong?
- What's the requirement?
- How to fix it?

### Example Error Messages From Backend

Backend returns detailed validation errors:
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, digit, and special character"
    }
  ]
}
```

**But frontend doesn't parse these!** It just shows generic "Registration failed" toast.

---

## Action Items Checklist

### Critical Fixes Required
- [ ] Fix filler onboarding to call `POST /onboarding/filler` (not `/user/register`)
- [ ] Fix filler settings to use `PUT` method (not `POST`)
- [ ] Update frontend password validator to require special character
- [ ] Implement creator registration backend endpoint (`POST /onboarding/creator`)
- [ ] Implement friendly error messages parsing backend validation errors
- [ ] Fix CORS configuration to set proper `access-control-allow-origin` header
- [ ] Trim password input to remove trailing whitespace
- [ ] Add real-time password strength indicator matching backend requirements

### Testing Required
- [ ] Test filler registration with valid password: `Password123!`
- [ ] Test filler registration with invalid password: `Password123` (should fail gracefully)
- [ ] Test filler demographics update
- [ ] Test creator registration flow (needs implementation)
- [ ] Verify CORS headers in response
- [ ] Test error message display in UI

---

## Architecture Issues Found

### Architectural Inconsistency #1: Two Registration Endpoints
- `/user/register` - Generic, minimal validation
- `/onboarding/filler` - Role-specific, saves profile data

**Should have:** Single clear registration flow per role

### Architectural Inconsistency #2: Creator Registration Missing
- Frontend form exists but no backend handler
- Frontend form collects data but doesn't send it

**Should have:** Backend endpoint for creator registration

### Architectural Inconsistency #3: Validation Rules Divergence
- Frontend and backend validate differently
- Users see OK locally, then 400 from server

**Should have:** Shared validation rules or documented requirements in UI

---

## Files Involved

### Frontend Files
- `app/filler/onboarding/page.tsx` - Calls wrong endpoint
- `app/filler/settings/page.tsx` - Uses wrong HTTP method
- `app/creator/onboarding/page.tsx` - No registration call

### Backend Files
- `backend/api/controllers/user.controller.go` - Register endpoint
- `backend/api/controllers/onboarding.controller.go` - CompleteFillerOnboarding
- `backend/security/validator.go` - Password validation rules
- `backend/api/routes/routes.go` - Route definitions

---

## Recommendations

### Immediate (Critical)
1. Fix the three endpoint/method mismatches
2. Add special character check to frontend password validation
3. Parse and display backend validation errors in UI

### Short Term (Week 1)
4. Implement creator registration endpoint
5. Configure CORS properly
6. Add password strength indicator

### Medium Term (Week 2)
7. Implement shared validation library
8. Add comprehensive error handling UI
9. Create registration flow tests

### Long Term
10. Refactor to single registration endpoint with role parameter
11. Add API documentation with field mappings
12. Implement OpenAPI/Swagger for frontend-backend contract

