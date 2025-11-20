#!/bin/bash

# OneTimer API Testing Script
# This script contains example curl commands to test all frontend API endpoints
# Base URL: http://localhost:8080/api

BASE_URL="http://localhost:8080/api"
JWT_TOKEN=""  # Will be set after login

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  OneTimer API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test section headers
print_section() {
    echo -e "${YELLOW}--- $1 ---${NC}"
}

# Function to make API call
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4

    if [ -z "$data" ]; then
        if [ -z "$auth" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN"
        fi
    else
        if [ -z "$auth" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data"
        fi
    fi
}

# ============================================
# 1. HEALTH CHECKS
# ============================================
print_section "1. HEALTH CHECKS"

echo "Testing /health endpoint:"
curl -s http://localhost:8080/health | jq '.'
echo ""

echo "Testing /api/health endpoint:"
curl -s $BASE_URL/health | jq '.'
echo ""

echo "Testing /api/healthz endpoint:"
curl -s $BASE_URL/healthz | jq '.'
echo ""

# ============================================
# 2. AUTHENTICATION
# ============================================
print_section "2. AUTHENTICATION & USER REGISTRATION"

echo "Register User (Filler):"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testfiller@example.com",
    "name": "Test Filler User",
    "role": "filler",
    "password": "TestPassword123!",
    "phone": "+1234567890"
  }')
echo $REGISTER_RESPONSE | jq '.'
echo ""

echo "Register Creator User:"
CREATOR_REGISTER=$(curl -s -X POST "$BASE_URL/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcreator@example.com",
    "name": "Test Creator User",
    "role": "creator",
    "password": "TestPassword123!",
    "phone": "+9876543210"
  }')
echo $CREATOR_REGISTER | jq '.'
echo ""

echo "Login as Filler:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testfiller@example.com",
    "password": "TestPassword123!"
  }')
echo $LOGIN_RESPONSE | jq '.'

# Extract JWT token
JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" == "null" ]; then
    echo -e "${RED}Failed to get JWT token. Login may have failed.${NC}"
    echo "Full response:"
    echo $LOGIN_RESPONSE | jq '.'
else
    echo -e "${GREEN}JWT Token: $JWT_TOKEN${NC}"
fi
echo ""

# ============================================
# 3. USER PROFILE
# ============================================
print_section "3. USER PROFILE OPERATIONS"

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get User Profile:"
    curl -s -X GET "$BASE_URL/user/profile" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Update User Profile:"
    curl -s -X PUT "$BASE_URL/user/profile" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -d '{
        "name": "Updated Test User",
        "phone": "+1111111111",
        "gender": "male",
        "location": "Lagos, Nigeria",
        "date_of_birth": "1990-01-01"
      }' | jq '.'
    echo ""

    echo "Get KYC Status:"
    curl -s -X GET "$BASE_URL/user/kyc-status" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
else
    echo -e "${RED}Skipping authenticated requests - no JWT token available${NC}"
fi
echo ""

# ============================================
# 4. SURVEYS
# ============================================
print_section "4. SURVEY OPERATIONS"

echo "List All Surveys:"
curl -s -X GET "$BASE_URL/survey?limit=5&offset=0" | jq '.'
echo ""

echo "Get Survey Templates:"
curl -s -X GET "$BASE_URL/survey/templates" | jq '.'
echo ""

# Try to get first survey if any exist
echo "Get First Survey (ID may vary):"
curl -s -X GET "$BASE_URL/survey" | jq '.data[0] | {id, title, description}' 2>/dev/null || echo "No surveys found"
echo ""

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Create Survey (Creator):"
    CREATE_SURVEY=$(curl -s -X POST "$BASE_URL/survey" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -d '{
        "title": "Test Customer Satisfaction Survey",
        "description": "Please provide your feedback on our service",
        "category": "customer-experience",
        "reward_amount": 500,
        "target_count": 50,
        "estimated_duration": 15,
        "questions": [
          {
            "id": "q1",
            "type": "single",
            "title": "How satisfied are you with our service?",
            "description": "Rate your overall satisfaction",
            "required": true,
            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
            "order": 0
          },
          {
            "id": "q2",
            "type": "text",
            "title": "What can we improve?",
            "description": "Please provide specific suggestions",
            "required": false,
            "order": 1
          },
          {
            "id": "q3",
            "type": "rating",
            "title": "Would you recommend us to others?",
            "required": true,
            "scale": 5,
            "order": 2
          }
        ],
        "demographic_filters": ["age_group", "location"],
        "demographics": {
          "age_groups": ["25-34", "35-44", "45-54"],
          "genders": ["male", "female"],
          "locations": ["Lagos", "Abuja", "Port Harcourt"]
        }
      }')
    echo $CREATE_SURVEY | jq '.'

    # Extract survey ID if creation was successful
    SURVEY_ID=$(echo $CREATE_SURVEY | jq -r '.data.survey_id // empty')
    if [ ! -z "$SURVEY_ID" ]; then
        echo -e "${GREEN}Survey created with ID: $SURVEY_ID${NC}"
        echo ""

        echo "Get Survey Questions:"
        curl -s -X GET "$BASE_URL/survey/$SURVEY_ID/questions" | jq '.'
        echo ""
    fi
else
    echo -e "${RED}Skipping survey creation - need to login as creator first${NC}"
fi
echo ""

# ============================================
# 5. FILLER OPERATIONS
# ============================================
print_section "5. FILLER (SURVEY TAKER) OPERATIONS"

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get Filler Dashboard:"
    curl -s -X GET "$BASE_URL/filler/dashboard" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Get Available Surveys:"
    curl -s -X GET "$BASE_URL/filler/surveys" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Get Completed Surveys:"
    curl -s -X GET "$BASE_URL/filler/surveys/completed" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Get Earnings History:"
    curl -s -X GET "$BASE_URL/filler/earnings" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 6. CREDITS & BILLING
# ============================================
print_section "6. CREDITS & BILLING"

echo "Get Credit Packages:"
curl -s -X GET "$BASE_URL/credits/packages" | jq '.'
echo ""

echo "Get Pricing Tiers:"
curl -s -X GET "$BASE_URL/billing/pricing-tiers" | jq '.'
echo ""

echo "Calculate Billing Cost:"
curl -s -X POST "$BASE_URL/billing/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "target_responses": 100,
    "estimated_duration": 15,
    "priority_placement": false,
    "demographic_filters": ["age_group", "location"],
    "extra_days": 0,
    "data_export": false
  }' | jq '.'
echo ""

echo "Validate Reward:"
curl -s -X POST "$BASE_URL/billing/validate-reward" \
  -H "Content-Type: application/json" \
  -d '{
    "reward_amount": 500,
    "target_responses": 100
  }' | jq '.'
echo ""

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get Creator Credits:"
    curl -s -X GET "$BASE_URL/creator/credits" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 7. EARNINGS & WITHDRAWALS
# ============================================
print_section "7. EARNINGS & WITHDRAWALS"

echo "Get Banks List:"
curl -s -X GET "$BASE_URL/withdrawal/banks" | jq '.' | head -20
echo ""

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get Earnings:"
    curl -s -X GET "$BASE_URL/earnings" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Get Withdrawal History:"
    curl -s -X GET "$BASE_URL/withdrawal/history" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 8. REFERRALS
# ============================================
print_section "8. REFERRALS"

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get Referrals:"
    curl -s -X GET "$BASE_URL/referral" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""

    echo "Get Referral Stats:"
    curl -s -X GET "$BASE_URL/referral/stats" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 9. ELIGIBILITY
# ============================================
print_section "9. ELIGIBILITY"

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Check Eligibility:"
    curl -s -X GET "$BASE_URL/eligibility/check" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 10. NOTIFICATIONS
# ============================================
print_section "10. NOTIFICATIONS"

if [ ! -z "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "Get Notifications:"
    curl -s -X GET "$BASE_URL/notifications" \
      -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
    echo ""
fi
echo ""

# ============================================
# 11. ONBOARDING
# ============================================
print_section "11. ONBOARDING"

echo "Complete Filler Onboarding:"
ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/filler" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Onboard",
    "email": "onboard.filler@example.com",
    "password": "OnboardPass123!",
    "profile": {
      "age_range": "25-34",
      "gender": "male",
      "country": "Nigeria",
      "state": "Lagos",
      "education": "bachelor",
      "employment": "employed",
      "income_range": "100000-200000",
      "interests": ["technology", "sports", "music"]
    }
  }')
echo $ONBOARD_RESPONSE | jq '.'
echo ""

echo "Complete Creator Onboarding:"
curl -s -X POST "$BASE_URL/onboarding/creator" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Creator",
    "email": "onboard.creator@example.com",
    "password": "CreatorPass123!",
    "company_name": "My Research Company",
    "company_website": "https://example.com",
    "profile": {
      "industry": "technology",
      "company_size": "50-100",
      "experience_years": 5
    }
  }' | jq '.'
echo ""

# ============================================
# 12. WAITLIST
# ============================================
print_section "12. WAITLIST"

echo "Join Waitlist (Filler):"
curl -s -X POST "$BASE_URL/waitlist/join" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "waitlist@example.com",
    "user_type": "filler"
  }' | jq '.'
echo ""

echo "Get Waitlist Stats:"
curl -s -X GET "$BASE_URL/waitlist/stats" | jq '.'
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Suite Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Test Results Summary:"
echo "  - Health checks: Tested"
echo "  - User registration: Tested"
echo "  - Authentication: Tested"
echo "  - User profiles: Tested (with auth)"
echo "  - Surveys: Tested (basic + creation with auth)"
echo "  - Filler operations: Tested (with auth)"
echo "  - Credits & Billing: Tested"
echo "  - Earnings & Withdrawals: Tested (with auth)"
echo "  - Referrals: Tested (with auth)"
echo "  - Eligibility: Tested (with auth)"
echo "  - Notifications: Tested (with auth)"
echo "  - Onboarding: Tested"
echo "  - Waitlist: Tested"
echo ""
echo -e "${GREEN}Testing complete! Check the responses above for any errors.${NC}"
echo ""
echo "To run this script:"
echo "  chmod +x test_api.sh"
echo "  ./test_api.sh"
echo ""
echo "For individual endpoint testing, use curl directly:"
echo "  curl -X GET http://localhost:8080/api/survey"
echo "  curl -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{...}'"
