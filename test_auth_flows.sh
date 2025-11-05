#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ONETIMER AUTHENTICATION FLOWS TEST${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Filler Login
echo -e "${YELLOW}1. Testing Filler Login Flow${NC}"
echo "Endpoint: POST /api/auth/login"
FILLER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }')
echo "Response: $FILLER_LOGIN"
echo ""

# Test 2: Filler Registration
echo -e "${YELLOW}2. Testing Filler Registration Flow${NC}"
echo "Endpoint: POST /api/user/register"
FILLER_REGISTER=$(curl -s -X POST "$BASE_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "password": "SecurePass123!",
    "role": "filler"
  }')
echo "Response: $FILLER_REGISTER"
echo ""

# Test 3: Send OTP
echo -e "${YELLOW}3. Testing OTP Flow${NC}"
echo "Endpoint: POST /api/auth/send-otp"
SEND_OTP=$(curl -s -X POST "$BASE_URL/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com"
  }')
echo "Send OTP Response: $SEND_OTP"
echo ""

# Test 4: Verify OTP (using development bypass OTP)
echo -e "${YELLOW}4. Testing OTP Verification Flow${NC}"
echo "Endpoint: POST /api/auth/verify-otp"
VERIFY_OTP=$(curl -s -X POST "$BASE_URL/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "otp": "123456"
  }')
echo "Verify OTP Response: $VERIFY_OTP"
echo ""

# Test 5: Get Filler Dashboard
echo -e "${YELLOW}5. Testing Filler Dashboard Access${NC}"
echo "Endpoint: GET /api/filler/dashboard"
FILLER_DASHBOARD=$(curl -s -X GET "$BASE_URL/api/filler/dashboard" \
  -H "Authorization: Bearer test_token")
echo "Response: $FILLER_DASHBOARD"
echo ""

# Test 6: Get Available Surveys
echo -e "${YELLOW}6. Testing Get Available Surveys${NC}"
echo "Endpoint: GET /api/survey"
GET_SURVEYS=$(curl -s -X GET "$BASE_URL/api/survey")
echo "Response: $GET_SURVEYS"
echo ""

# Test 7: Get User Profile
echo -e "${YELLOW}7. Testing Get User Profile${NC}"
echo "Endpoint: GET /api/user/profile"
GET_PROFILE=$(curl -s -X GET "$BASE_URL/api/user/profile")
echo "Response: $GET_PROFILE"
echo ""

# Test 8: Check Admin Login (using /api/auth/login with admin role)
echo -e "${YELLOW}8. Testing Admin Login Flow${NC}"
echo "Endpoint: POST /api/auth/login"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass123"
  }')
echo "Response: $ADMIN_LOGIN"
echo ""

# Test 9: Check Database Connection
echo -e "${YELLOW}9. Testing Database Connection${NC}"
echo "Checking PostgreSQL Connection..."
DB_CHECK=$(docker exec onetimer_postgres_1 psql -U user -d onetimer -c "SELECT COUNT(*) as user_count FROM users;" 2>&1)
echo "Database Status: $DB_CHECK"
echo ""

# Test 10: Onboarding Flow
echo -e "${YELLOW}10. Testing Onboarding Flow${NC}"
echo "Endpoint: POST /api/onboarding/filler"
ONBOARDING=$(curl -s -X POST "$BASE_URL/api/onboarding/filler" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "demographics": {
      "age_range": "25-34",
      "gender": "M",
      "location": "Lagos",
      "education": "bachelor"
    }
  }')
echo "Response: $ONBOARDING"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All endpoints have been tested${NC}"
echo -e "${YELLOW}Note: Check responses above for actual success/failure${NC}"
