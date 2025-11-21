#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_test() {
    echo -e "${YELLOW}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 Starting Backend Endpoint Tests"
echo "=================================="

# Kill any existing backend process
pkill -f onetimer-backend 2>/dev/null

# Start backend in background
cd /home/obeej/Desktop/onetimer/backend
echo "Starting backend server in background..."
nohup ./onetimer-backend > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Test 1: Health Check
print_test "Health endpoint"
if curl -s -f http://localhost:8081/health > /dev/null; then
    print_success "Health endpoint working"
else
    print_error "Health endpoint failed"
    echo "Backend log:"
    tail -10 backend.log
fi

# Test 2: API Health
print_test "API health endpoint"
if curl -s -f http://localhost:8081/api/health > /dev/null; then
    print_success "API health endpoint working"
else
    print_error "API health endpoint failed"
fi

# Test 3: User Registration (New Validation)
print_test "User registration with validation"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8081/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "test@example.com",
    "password": "password123",
    "role": "filler"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success\|ok"; then
    print_success "User registration working"
else
    print_error "User registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 4: Login
print_test "User login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token\|ok"; then
    print_success "User login working"
    # Extract token for authenticated requests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    print_error "User login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 5: Protected Route (User Profile)
if [ ! -z "$TOKEN" ]; then
    print_test "Protected route (user profile)"
    PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
      http://localhost:8081/api/user/profile)
    
    if echo "$PROFILE_RESPONSE" | grep -q "email\|user"; then
        print_success "Protected route working"
    else
        print_error "Protected route failed"
        echo "Response: $PROFILE_RESPONSE"
    fi
fi

# Test 6: Validation Error Test
print_test "Validation error handling"
VALIDATION_RESPONSE=$(curl -s -X POST http://localhost:8081/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "",
    "email": "invalid-email",
    "password": "123"
  }')

if echo "$VALIDATION_RESPONSE" | grep -q "VALIDATION_ERROR\|validation"; then
    print_success "Validation error handling working"
else
    print_error "Validation error handling failed"
    echo "Response: $VALIDATION_RESPONSE"
fi

# Test 7: Survey Creation (if token available)
if [ ! -z "$TOKEN" ]; then
    print_test "Survey creation with validation"
    SURVEY_RESPONSE=$(curl -s -X POST http://localhost:8081/api/survey \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Test Survey",
        "description": "This is a test survey for validation",
        "category": "market_research",
        "reward_amount": 500,
        "estimated_duration": 10,
        "target_responses": 100
      }')
    
    if echo "$SURVEY_RESPONSE" | grep -q "success\|id"; then
        print_success "Survey creation working"
    else
        print_error "Survey creation failed"
        echo "Response: $SURVEY_RESPONSE"
    fi
fi

echo ""
echo "📊 Test Summary"
echo "==============="
echo "Backend is running in background (PID: $BACKEND_PID)"
echo "Log file: backend/backend.log"
echo ""
echo "To stop backend: kill $BACKEND_PID"
echo "To view logs: tail -f backend/backend.log"

cd ..
