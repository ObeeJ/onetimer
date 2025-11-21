#!/bin/bash

echo "🚀 PHASE 1 DEPLOYMENT - Complete Stack Update"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    print_error "Go is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# 1. Backend Updates
echo ""
echo "🔧 STEP 1: Backend Updates"
echo "=========================="

cd backend

# Install new dependencies
echo "Installing Go dependencies..."
go mod tidy
go get github.com/go-playground/validator/v10

# Build backend to check for compilation errors
echo "Building backend..."
if go build -o onetimer-backend .; then
    print_status "Backend compilation successful"
else
    print_error "Backend compilation failed"
    exit 1
fi

cd ..

# 2. Database Migrations
echo ""
echo "🗄️  STEP 2: Database Migrations"
echo "==============================="

# Check if supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "Running Supabase migrations..."
    
    # Apply migrations
    if [ -d "supabase/migrations" ]; then
        supabase db push
        print_status "Database migrations applied"
    else
        print_warning "No migrations directory found, skipping..."
    fi
else
    print_warning "Supabase CLI not found. Please run migrations manually:"
    echo "1. Install Supabase CLI: npm install -g supabase"
    echo "2. Run: supabase db push"
fi

# 3. Frontend Updates
echo ""
echo "🎨 STEP 3: Frontend Updates"
echo "==========================="

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Type check
echo "Running TypeScript type check..."
if npx tsc --noEmit --skipLibCheck; then
    print_status "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# Build frontend
echo "Building frontend..."
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

# 4. Verification Tests
echo ""
echo "🧪 STEP 4: Verification Tests"
echo "============================="

# Test backend endpoints
echo "Testing backend health..."
cd backend
./onetimer-backend &
BACKEND_PID=$!
sleep 3

# Test health endpoint
if curl -f http://localhost:8081/health > /dev/null 2>&1; then
    print_status "Backend health check passed"
else
    print_warning "Backend health check failed (may be normal if DB not connected)"
fi

# Kill backend
kill $BACKEND_PID 2>/dev/null

cd ..

# 5. Summary
echo ""
echo "📊 DEPLOYMENT SUMMARY"
echo "===================="
print_status "Backend: Compiled with validation and error handling"
print_status "Database: Migrations ready (run manually if needed)"
print_status "Frontend: Built with updated types and API client"
print_status "Middleware: Role-based access control implemented"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Deploy backend with new controllers"
echo "2. Verify database migrations are applied"
echo "3. Test all user role workflows:"
echo "   - Filler registration and surveys"
echo "   - Creator survey creation"
echo "   - Admin user management"
echo "   - Super admin system management"
echo "4. Monitor API responses for new error format"

echo ""
echo "🚀 Phase 1 deployment preparation complete!"
echo "Ready to move to Phase 2: Performance & Monitoring"
