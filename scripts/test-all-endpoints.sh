#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}🔷 $1${NC}"
    echo "=================================="
}

print_test() {
    echo -e "${YELLOW}🧪 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

BASE_URL="http://localhost:8081"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_test "$test_name"
    
    response=$(eval "$curl_command" 2>/dev/null)
    
    if echo "$response" | grep -q "$expected_pattern"; then
        print_success "$test_name - PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name - FAILED"
        echo "Response: $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "🚀 COMPREHENSIVE BACKEND ENDPOINT TESTING"
echo "=========================================="

# 1. SYSTEM HEALTH TESTS
print_header "SYSTEM HEALTH TESTS"

run_test "Health Check" \
    "curl -s $BASE_URL/health" \
    "ok"

run_test "API Health Check" \
    "curl -s $BASE_URL/api/health" \
    "ok"

# 2. USER REGISTRATION TESTS (All Roles)
print_header "USER REGISTRATION TESTS"

# Create test users for each role
run_test "Register Filler User" \
    "curl -s -X POST $BASE_URL/api/user/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Filler\",\"email\":\"filler@test.com\",\"password\":\"Password123!\",\"role\":\"filler\"}'" \
    "ok"

run_test "Register Creator User" \
    "curl -s -X POST $BASE_URL/api/user/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Creator\",\"email\":\"creator@test.com\",\"password\":\"Password123!\",\"role\":\"creator\"}'" \
    "ok"

run_test "Register Admin User" \
    "curl -s -X POST $BASE_URL/api/user/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Admin\",\"email\":\"admin@test.com\",\"password\":\"Password123!\",\"role\":\"admin\"}'" \
    "ok"

# 3. AUTHENTICATION TESTS
print_header "AUTHENTICATION TESTS"

# Login as each user type and store tokens
FILLER_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{"email":"filler@test.com","password":"Password123!"}')
FILLER_TOKEN=$(echo "$FILLER_LOGIN" | jq -r '.token // empty')

CREATOR_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{"email":"creator@test.com","password":"Password123!"}')
CREATOR_TOKEN=$(echo "$CREATOR_LOGIN" | jq -r '.token // empty')

ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@test.com","password":"Password123!"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token // empty')

run_test "Filler Login" \
    "echo '$FILLER_LOGIN'" \
    "token"

run_test "Creator Login" \
    "echo '$CREATOR_LOGIN'" \
    "token"

run_test "Admin Login" \
    "echo '$ADMIN_LOGIN'" \
    "token"

# 4. FILLER ENDPOINTS
print_header "FILLER USER ENDPOINTS"

if [ ! -z "$FILLER_TOKEN" ] && [ "$FILLER_TOKEN" != "null" ]; then
    run_test "Filler Profile Access" \
        "curl -s -H 'Authorization: Bearer $FILLER_TOKEN' $BASE_URL/api/user/profile" \
        "filler"
    
    run_test "Filler Dashboard" \
        "curl -s -H 'Authorization: Bearer $FILLER_TOKEN' $BASE_URL/api/filler/dashboard" \
        "dashboard"
    
    run_test "Available Surveys for Filler" \
        "curl -s -H 'Authorization: Bearer $FILLER_TOKEN' $BASE_URL/api/filler/surveys" \
        "surveys"
    
    run_test "Filler Earnings" \
        "curl -s -H 'Authorization: Bearer $FILLER_TOKEN' $BASE_URL/api/earnings" \
        "earnings"
else
    print_error "No filler token - skipping filler tests"
fi

# 5. CREATOR ENDPOINTS
print_header "CREATOR USER ENDPOINTS"

if [ ! -z "$CREATOR_TOKEN" ] && [ "$CREATOR_TOKEN" != "null" ]; then
    run_test "Creator Profile Access" \
        "curl -s -H 'Authorization: Bearer $CREATOR_TOKEN' $BASE_URL/api/user/profile" \
        "creator"
    
    run_test "Creator Dashboard" \
        "curl -s -H 'Authorization: Bearer $CREATOR_TOKEN' $BASE_URL/api/creator/dashboard" \
        "dashboard"
    
    run_test "Creator Surveys List" \
        "curl -s -H 'Authorization: Bearer $CREATOR_TOKEN' $BASE_URL/api/creator/surveys" \
        "surveys"
    
    run_test "Creator Credits" \
        "curl -s -H 'Authorization: Bearer $CREATOR_TOKEN' $BASE_URL/api/creator/credits" \
        "credits"
    
    # Test survey creation
    run_test "Create Survey" \
        "curl -s -X POST $BASE_URL/api/survey -H 'Authorization: Bearer $CREATOR_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Test Survey\",\"description\":\"Test survey description\",\"category\":\"market_research\",\"reward\":500,\"estimated_time\":10,\"max_responses\":100}'" \
        "id"
else
    print_error "No creator token - skipping creator tests"
fi

# 6. ADMIN ENDPOINTS
print_header "ADMIN USER ENDPOINTS"

if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    run_test "Admin Profile Access" \
        "curl -s -H 'Authorization: Bearer $ADMIN_TOKEN' $BASE_URL/api/user/profile" \
        "admin"
    
    run_test "Admin Users List" \
        "curl -s -H 'Authorization: Bearer $ADMIN_TOKEN' $BASE_URL/api/admin/users" \
        "users"
    
    run_test "Admin Surveys List" \
        "curl -s -H 'Authorization: Bearer $ADMIN_TOKEN' $BASE_URL/api/admin/surveys" \
        "surveys"
else
    print_error "No admin token - skipping admin tests"
fi

# 7. PUBLIC ENDPOINTS
print_header "PUBLIC ENDPOINTS"

run_test "Get All Surveys (Public)" \
    "curl -s $BASE_URL/api/survey" \
    "data"

run_test "Waitlist Stats" \
    "curl -s $BASE_URL/api/waitlist/stats" \
    "stats"

# 8. VALIDATION TESTS
print_header "VALIDATION TESTS"

run_test "Invalid Email Registration" \
    "curl -s -X POST $BASE_URL/api/user/register -H 'Content-Type: application/json' -d '{\"name\":\"Test\",\"email\":\"invalid-email\",\"password\":\"Password123!\",\"role\":\"filler\"}'" \
    "error"

run_test "Weak Password Registration" \
    "curl -s -X POST $BASE_URL/api/user/register -H 'Content-Type: application/json' -d '{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123\",\"role\":\"filler\"}'" \
    "error"

run_test "Invalid Login" \
    "curl -s -X POST $BASE_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"nonexistent@test.com\",\"password\":\"wrongpassword\"}'" \
    "error"

# 9. UNAUTHORIZED ACCESS TESTS
print_header "UNAUTHORIZED ACCESS TESTS"

run_test "Access Protected Route Without Token" \
    "curl -s $BASE_URL/api/user/profile" \
    "error"

run_test "Access Admin Route Without Token" \
    "curl -s $BASE_URL/api/admin/users" \
    "error"

# SUMMARY
echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "ALL TESTS PASSED! 🎉"
else
    print_error "$FAILED_TESTS tests failed"
fi
