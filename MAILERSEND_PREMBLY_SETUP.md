# MailerSend & Prembly Integration Guide

## 🔧 MailerSend Configuration

### 1. Get Your MailerSend API Key
1. Go to https://www.mailersend.com/
2. Sign up or log in
3. Navigate to **Settings** → **API Tokens**
4. Create a new API token with **Full Access** permissions
5. Copy the API key (starts with `mlsn.`)

### 2. Configure Environment Variables

**In `.env` (local development):**
```bash
MAILERSEND_API_KEY=mlsn.your_actual_api_key_here
EMAIL_FROM=noreply@onetimesurvey.xyz
```

**In `.env.production`:**
```bash
MAILERSEND_API_KEY=mlsn.your_production_api_key_here
EMAIL_FROM=noreply@onetimesurvey.xyz
```

### 3. Verify Domain in MailerSend
1. Go to **Domains** in MailerSend dashboard
2. Add `onetimesurvey.xyz`
3. Add the required DNS records (SPF, DKIM, CNAME)
4. Wait for verification (usually 15-30 minutes)

### 4. Test MailerSend Integration

**Restart backend after adding API key:**
```bash
cd backend
go build -o onetimer-backend cmd/onetimer-backend/main.go
./onetimer-backend
```

**You should see in logs:**
```
✅ Email service initialized | primary_provider=MailerSend fallback=SendGrid/SMTP
```

**Test OTP email:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Check your email inbox for the OTP code!

---

## 🔐 Prembly NIN Verification

### 1. When is Prembly Called?

**Endpoint:** `POST /api/user/kyc/verify-nin`

**Triggered when:**
- A **filler user** submits their NIN (National Identification Number) for KYC verification
- During filler onboarding flow
- From the filler dashboard KYC section

**Flow:**
1. User enters 11-digit NIN
2. Frontend sends to `/api/user/kyc/verify-nin` with JWT token
3. Backend calls Prembly API: `POST https://api.prembly.com/identitypass/verification/nin`
4. Prembly returns user data (name, phone, DOB, gender)
5. Backend saves to `kyc_verifications` table

### 2. Get Your Prembly API Key

1. Go to https://prembly.com/
2. Sign up for an account
3. Navigate to **API Keys** section
4. Copy your API key (starts with `test_` for testing or `live_` for production)

### 3. Configure Environment Variables

**In `.env`:**
```bash
PREMBLY_API_KEY=test_your_prembly_key_here
```

**In `.env.production`:**
```bash
PREMBLY_API_KEY=live_your_production_prembly_key
```

### 4. Test Prembly Integration

#### Step 1: Get a Filler User JWT Token

**Option A: Sign up a new filler user**
```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "testfiller@example.com"}'

# 2. Verify OTP (check email for code)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "testfiller@example.com", "otp": "123456"}'

# 3. Complete registration (save the token from response)
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testfiller@example.com",
    "password": "Test123!@#",
    "full_name": "Test Filler",
    "role": "filler"
  }'
```

**Option B: Login existing filler user**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "password123"
  }'
```

#### Step 2: Test NIN Verification

```bash
# Replace TOKEN with actual JWT from login/register
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test with sample NIN (11 digits)
curl -X POST http://localhost:3000/api/user/kyc/verify-nin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nin": "12345678901"}' \
  -w "\n\n📊 Status Code: %{http_code}\n"
```

**Expected Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "nin": "12345678901",
    "status": "verified",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+2348012345678",
    "date_of_birth": "1990-01-01",
    "gender": "Male",
    "verified_at": "2025-12-14T10:30:00Z"
  }
}
```

**Expected Error Responses:**
```json
// Missing JWT token
{"error": "Authentication required"}

// Invalid NIN format
{"error": "Invalid request body"}

// Prembly API failure
{"error": "NIN verification failed"}
```

### 5. Prembly Code Location

**Service:** [`backend/services/prembly.go`](backend/services/prembly.go)
**Handler:** [`backend/api/handlers/kyc.go:27`](backend/api/handlers/kyc.go#L27)
**Route:** [`backend/api/routes/routes.go:123`](backend/api/routes/routes.go#L123)

**VerifyNIN function:**
```go
func (h *KYCHandler) VerifyKYC(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uuid.UUID)

    var req KYCRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // Calls Prembly API
    resp, err := h.prembly.VerifyNIN(req.NIN)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "NIN verification failed"})
    }

    // Save to database...
    return c.JSON(fiber.Map{"status": "success", "data": kyc})
}
```

---

## 🧪 Full Integration Test Script

Run this complete test:

```bash
#!/bin/bash

echo "🧪 Testing MailerSend & Prembly Integration"
echo "==========================================="

# 1. Test MailerSend OTP
echo ""
echo "1️⃣  Testing MailerSend OTP..."
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  -s | jq '.'

echo ""
read -p "Enter OTP from email: " OTP

# 2. Verify OTP
echo ""
echo "2️⃣  Verifying OTP..."
VERIFY_RESPONSE=$(curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"otp\": \"$OTP\"}" \
  -s)

echo $VERIFY_RESPONSE | jq '.'

# 3. Register user
echo ""
echo "3️⃣  Registering filler user..."
REGISTER_RESPONSE=$(curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "full_name": "Test User",
    "role": "filler"
  }' \
  -s)

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 4. Test Prembly NIN verification
echo ""
echo "4️⃣  Testing Prembly NIN Verification..."
curl -X POST http://localhost:3000/api/user/kyc/verify-nin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nin": "12345678901"}' \
  -s | jq '.'

echo ""
echo "✅ Integration test complete!"
```

---

## 📊 Monitoring & Debugging

### Check Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Docker logs
docker-compose logs -f backend
```

### Sentry Monitoring
- **MailerSend errors:** Tagged with `email_provider=mailersend`
- **Prembly errors:** Tagged with `service=prembly`, `endpoint=nin_verification`

### Common Issues

**MailerSend:**
- ❌ Domain not verified → Verify DNS records
- ❌ API key invalid → Check API token in dashboard
- ❌ Rate limits → Upgrade plan or reduce send frequency

**Prembly:**
- ❌ Invalid NIN format → Must be exactly 11 digits
- ❌ API key expired → Renew in Prembly dashboard
- ❌ Timeout → Increase timeout in `prembly.go:50`

---

## 🎯 Next Steps

1. ✅ Add `MAILERSEND_API_KEY` to your `.env` file
2. ✅ Add `PREMBLY_API_KEY` to your `.env` file
3. ✅ Verify your domain in MailerSend dashboard
4. ✅ Rebuild backend: `go build -o onetimer-backend cmd/onetimer-backend/main.go`
5. ✅ Test both integrations using the scripts above
6. ✅ Monitor Sentry for any errors
7. ✅ Deploy to production with production API keys

**Questions?** Check the code:
- MailerSend: [`backend/services/mailersend.go`](backend/services/mailersend.go)
- Prembly: [`backend/services/prembly.go`](backend/services/prembly.go)
- Email Service: [`backend/services/email.go`](backend/services/email.go)
