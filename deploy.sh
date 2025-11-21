#!/bin/bash

# OneTime Survey Platform - Production Deployment Script
set -e

echo "🚀 OneTime Survey Platform - Production Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found."
    echo "   Please copy .env.production template and update with your production values."
    exit 1
fi

echo "✅ Environment files found"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run type checking
echo "🔧 Running type checking..."
npm run type-check

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build backend
echo "🏗️  Building backend..."
cd backend
go mod tidy
go build -o onetimer-backend cmd/onetimer-backend/main.go
cd ..

echo "✅ Build completed successfully"

# Run production tests
echo "🧪 Running production tests..."
npm run test:production

echo "✅ All tests passed"

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p dist
cp -r .next dist/
cp -r backend/onetimer-backend dist/
cp -r public dist/
cp package.json dist/
cp .env.production dist/.env

echo "✅ Deployment package created in ./dist/"

echo ""
echo "🎉 DEPLOYMENT READY!"
echo "==================="
echo "Next steps:"
echo "1. Upload ./dist/ to your production server"
echo "2. Set environment variables from .env.production"
echo "3. Run: npm start (frontend) and ./onetimer-backend (backend)"
echo "4. Configure reverse proxy (nginx/apache) to serve both services"
echo ""
echo "Production URLs:"
echo "- Frontend: http://your-domain.com"
echo "- Backend API: http://your-domain.com/api"
echo "- Health Check: http://your-domain.com/api/healthz"
