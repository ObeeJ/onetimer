#!/bin/bash

# Test Prembly NIN Verification Endpoint
# Endpoint: POST /api/user/kyc/verify-nin
# Requires: Valid JWT token (filler user)

echo "🔐 Testing Prembly NIN Verification"
echo "===================================="
echo ""

# You need to replace this with a real filler user JWT token
TOKEN="your_filler_jwt_token_here"

# Test NIN (11 digits required)
NIN="12345678901"

echo "📍 Endpoint: POST http://localhost:3000/api/user/kyc/verify-nin"
echo "📋 NIN: $NIN"
echo ""

# Make request
curl -X POST http://localhost:3000/api/user/kyc/verify-nin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"nin\": \"$NIN\"}" \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

echo ""
echo "ℹ️  Notes:"
echo "   - You need a valid filler user JWT token"
echo "   - NIN must be exactly 11 digits"
echo "   - Requires PREMBLY_API_KEY in .env"
echo "   - Endpoint: backend/api/handlers/kyc.go:27"
echo ""
