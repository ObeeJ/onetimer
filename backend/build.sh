#!/bin/bash

echo "🔧 Go Build Script for Fillers Backend"
echo "======================================"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed"
    echo "📦 Install Go from: https://golang.org/dl/"
    echo "🐳 Or use Docker: docker build -t fillers-backend ."
    exit 1
fi

# Build the application
echo "🏗️ Building Go application..."
go mod tidy
go build -o fillers-backend main.go

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Binary: fillers-backend"
    echo "🚀 Run with: ./fillers-backend"
else
    echo "❌ Build failed"
    exit 1
fi