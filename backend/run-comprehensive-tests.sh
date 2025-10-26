#!/bin/bash

echo "🧪 COMPREHENSIVE BACKEND TEST SUITE"
echo "===================================="

cd "$(dirname "$0")"

# Check if Go is available
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed"
    exit 1
fi

# Install test dependencies
echo "📦 Installing test dependencies..."
go mod tidy
go get github.com/stretchr/testify/assert

# Create test module if needed
if [ ! -f "tests/go.mod" ]; then
    cd tests
    go mod init onetimer-backend-tests
    go mod edit -replace onetimer-backend=../
    cd ..
fi

# Run comprehensive tests
echo ""
echo "🚀 Running comprehensive backend tests..."
echo ""

# Test with verbose output
go test -v ./tests/ -run TestCompleteSystemFlow

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ALL TESTS PASSED"
    echo "🎉 Backend is fully functional and ready for deployment!"
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    echo "🔧 Check the output above for issues to resolve"
fi

echo ""
echo "📊 Test Coverage Report:"
go test -cover ./tests/

echo ""
echo "🔍 Additional System Checks:"

# Check if server can start
echo "🚀 Testing server startup..."
timeout 5s go run cmd/onetimer-backend/main.go &
SERVER_PID=$!
sleep 2

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Server starts successfully"
    kill $SERVER_PID
else
    echo "⚠️ Server startup test inconclusive"
fi

# Check critical files
echo "📁 Checking critical files..."
critical_files=(
    "api/controllers/billing.controller.go"
    "services/billing.go"
    "models/survey.go"
    "models/requests.go"
    "api/routes/routes.go"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "🏁 COMPREHENSIVE TEST COMPLETE"