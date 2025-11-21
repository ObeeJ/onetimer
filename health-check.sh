#!/bin/bash

# OneTime Survey Platform - Production Health Check
# Run this script to verify production deployment

DOMAIN=${1:-"localhost"}
FRONTEND_PORT=${2:-"3000"}
BACKEND_PORT=${3:-"8081"}

echo "🏥 OneTime Survey Platform - Health Check"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Frontend Port: $FRONTEND_PORT"
echo "Backend Port: $BACKEND_PORT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Function to check service
check_service() {
    local service=$1
    echo -n "Checking $service service... "
    
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        return 1
    fi
}

# Check if running on production server
if [ "$DOMAIN" != "localhost" ]; then
    FRONTEND_URL="https://$DOMAIN"
    BACKEND_URL="https://$DOMAIN/api"
else
    FRONTEND_URL="http://$DOMAIN:$FRONTEND_PORT"
    BACKEND_URL="http://$DOMAIN:$BACKEND_PORT/api"
fi

echo "🔍 SYSTEM SERVICES"
echo "=================="
failed_services=0

if command -v systemctl >/dev/null 2>&1; then
    check_service "onetimer-frontend" || ((failed_services++))
    check_service "onetimer-backend" || ((failed_services++))
    check_service "nginx" || ((failed_services++))
else
    echo -e "${YELLOW}⚠️  systemctl not available, skipping service checks${NC}"
fi

echo ""
echo "🌐 ENDPOINT HEALTH"
echo "=================="
failed_endpoints=0

# Frontend checks
check_endpoint "$FRONTEND_URL" "Frontend Home" || ((failed_endpoints++))
check_endpoint "$FRONTEND_URL/api/healthz" "Frontend Health" || ((failed_endpoints++))

# Backend checks
check_endpoint "$BACKEND_URL/health" "Backend Health" || ((failed_endpoints++))
check_endpoint "$BACKEND_URL/waitlist/stats" "Backend API" || ((failed_endpoints++))

# Authentication endpoints
check_endpoint "$FRONTEND_URL/api/auth/forgot-password" "Auth API" 404 || ((failed_endpoints++))

echo ""
echo "🔐 SECURITY CHECKS"
echo "=================="
security_issues=0

# Check HTTPS (if not localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo -n "Checking HTTPS redirect... "
    http_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$DOMAIN" 2>/dev/null)
    if [ "$http_response" = "301" ] || [ "$http_response" = "302" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((security_issues++))
    fi
    
    echo -n "Checking SSL certificate... "
    if curl -s --max-time 10 "https://$DOMAIN" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ VALID${NC}"
    else
        echo -e "${RED}❌ INVALID${NC}"
        ((security_issues++))
    fi
else
    echo -e "${YELLOW}⚠️  Localhost detected, skipping HTTPS checks${NC}"
fi

echo ""
echo "📊 HEALTH SUMMARY"
echo "================="

total_issues=$((failed_services + failed_endpoints + security_issues))

if [ $failed_services -gt 0 ]; then
    echo -e "${RED}❌ Services: $failed_services issues${NC}"
fi

if [ $failed_endpoints -gt 0 ]; then
    echo -e "${RED}❌ Endpoints: $failed_endpoints issues${NC}"
fi

if [ $security_issues -gt 0 ]; then
    echo -e "${RED}❌ Security: $security_issues issues${NC}"
fi

if [ $total_issues -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED - SYSTEM HEALTHY${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $total_issues ISSUES FOUND - NEEDS ATTENTION${NC}"
    exit 1
fi
