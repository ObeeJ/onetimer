# API Testing Guide - Quick Reference

## Quick Start

Backend is running on: `http://localhost:8080`

### Run Full Test Suite
```bash
cd /home/obeej/Desktop/onetimer
./test_api.sh
```

---

## Manual Testing with CURL

### 1. Test Health
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/health
```

### 2. Register & Login
```bash
# Register
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "role": "filler",
    "password": "TestPassword123!",
    "phone": "+1234567890"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 3. Use JWT Token for Protected Endpoints
Save the token from login response:
```bash
JWT_TOKEN="your-jwt-token-here"

# Example: Get profile
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 4. Common Endpoints for Testing

#### Public Endpoints (No Auth)
```bash
# List surveys
curl http://localhost:8080/api/survey

# Get single survey
curl http://localhost:8080/api/survey/{survey-id}

# List credit packages
curl http://localhost:8080/api/credits/packages

# Get withdrawal banks
curl http://localhost:8080/api/withdrawal/banks
```

#### Protected Endpoints (Need JWT)
```bash
# Get user profile
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get filler dashboard
curl -X GET http://localhost:8080/api/filler/dashboard \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get available surveys
curl -X GET http://localhost:8080/api/filler/surveys \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get earnings
curl -X GET http://localhost:8080/api/earnings \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 5. Create a Survey (Creator)
```bash
curl -X POST http://localhost:8080/api/survey \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "title": "My Test Survey",
    "description": "Test survey description",
    "category": "customer-experience",
    "reward_amount": 500,
    "target_count": 50,
    "estimated_duration": 15,
    "questions": [
      {
        "type": "single",
        "title": "Question 1?",
        "required": true,
        "options": ["Option 1", "Option 2", "Option 3"],
        "order": 0
      }
    ]
  }'
```

### 6. Submit Survey Response (Filler)
```bash
curl -X POST http://localhost:8080/api/survey/{survey-id}/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "responses": {
      "q1": "Option 1",
      "q2": "My answer",
      "q3": 5
    },
    "time_spent": 600
  }'
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "ok": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details",
  "message": "User-friendly message"
}
```

---

## Common Status Codes
- `200 OK` - Successful GET/POST
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error

---

## Headers Required

### Public Endpoints
```
Content-Type: application/json
```

### Protected Endpoints
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

---

## Testing Different User Roles

### Create Filler User
```bash
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "filler@example.com",
    "name": "Filler User",
    "role": "filler",
    "password": "Password123!",
    "phone": "+1234567890"
  }'
```

### Create Creator User
```bash
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "name": "Creator User",
    "role": "creator",
    "password": "Password123!",
    "phone": "+0987654321"
  }'
```

### Create Admin User (via Super Admin)
```bash
curl -X POST http://localhost:8080/api/super-admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["users_management", "surveys_management"]
  }'
```

---

## Testing File Uploads

### Upload KYC Document
```bash
curl -X POST http://localhost:8080/api/upload/kyc \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "document_type=passport" \
  -F "file=@/path/to/document.pdf"
```

### Upload Survey Media
```bash
curl -X POST http://localhost:8080/api/upload/survey-media \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "survey_id=survey-uuid" \
  -F "file=@/path/to/image.jpg"
```

---

## Testing WebSocket

### Connect to WebSocket
```bash
# Using wscat (npm install -g wscat)
wscat -c "ws://localhost:8080/ws?token=$JWT_TOKEN"

# Once connected, you can receive messages like:
# - survey_notification
# - payment_status
# - withdrawal_status
```

---

## Batch Testing Script

Create a file `test_requests.sh` to test multiple endpoints:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api"
JWT_TOKEN=""

# Register
echo "=== Registering User ==="
REG=$(curl -s -X POST $BASE_URL/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"batch@test.com","name":"Batch Test","role":"filler","password":"Pass123!","phone":"+1234567890"}')
echo $REG | jq '.'

# Login
echo -e "\n=== Logging In ==="
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"batch@test.com","password":"Pass123!"}')
echo $LOGIN | jq '.'

JWT_TOKEN=$(echo $LOGIN | jq -r '.token')
echo "Token: $JWT_TOKEN"

# Get Profile
echo -e "\n=== Getting Profile ==="
curl -s -X GET $BASE_URL/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Get Dashboard
echo -e "\n=== Getting Filler Dashboard ==="
curl -s -X GET $BASE_URL/filler/dashboard \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Get Surveys
echo -e "\n=== Getting Available Surveys ==="
curl -s -X GET $BASE_URL/filler/surveys \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
```

---

## Useful Tools for API Testing

### 1. **cURL** (command line)
```bash
curl -X METHOD URL -H "Header: value" -d '{"key":"value"}'
```

### 2. **Postman** (GUI)
- Create a collection with all endpoints
- Set up environment variables for JWT token and base URL
- Save common requests for reuse

### 3. **REST Client VS Code Extension**
- Create a `.rest` file in your project
- Test directly in VS Code

### 4. **HTTPie** (user-friendly cURL alternative)
```bash
http POST localhost:8080/api/auth/login email=user@example.com password=Pass123!
```

### 5. **jq** (JSON processor)
```bash
# Pretty print JSON
curl -s ... | jq '.'

# Extract specific field
curl -s ... | jq '.data.token'

# Filter array
curl -s ... | jq '.data[] | select(.status=="active")'
```

---

## Debugging Tips

### 1. Check Server Logs
```bash
# The backend logs important information
# Look for error messages in the output
```

### 2. Verbose cURL
```bash
curl -v http://localhost:8080/api/health
# Shows request/response headers and body
```

### 3. Check Database Connection
The backend output shows:
```
✅ Database connected successfully
✅ Database schema initialized successfully
```

### 4. Verify Request Format
- Check Content-Type header is `application/json`
- Ensure JSON is valid (use jq or JSONLint)
- Verify all required fields are present

### 5. Check JWT Token
```bash
# Decode JWT (online at jwt.io or use jwt-cli)
# Token has format: header.payload.signature
# Should contain user_id and role in payload
```

---

## Common Issues & Solutions

### "Invalid request" error
- Check JSON syntax
- Verify all required fields are present
- Check Content-Type header

### "Unauthorized" error
- JWT token is missing or invalid
- Token may have expired (generate new one)
- Include Bearer prefix in Authorization header

### "Email already registered" error
- Use a different email address
- Check if user already exists

### "Database unavailable" error
- Ensure backend is running
- Check database connection string
- Verify Supabase is accessible

### CORS errors (when testing from browser)
- Backend should have CORS configured
- Check preflight requests (OPTIONS)
- Verify allowed origins

---

## Frontend Integration Notes

The frontend should:
1. Store JWT token in httpOnly cookie or secure storage
2. Include `Authorization: Bearer {token}` header for protected routes
3. Handle 401 errors by redirecting to login
4. Handle rate limiting (100 req/min per IP)
5. Implement proper error handling and user feedback

---

## Rate Limiting
- **Limit:** 100 requests per minute per IP/User
- **Headers in response:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 99`
  - `X-RateLimit-Reset: {unix_timestamp}`

---

## References
- Full API documentation: `API_ENDPOINTS_REFERENCE.md`
- Test script: `test_api.sh`
- Backend running on: `http://localhost:8080`
- API base path: `http://localhost:8080/api`
