#!/bin/bash

echo "Go Lint Check Results:"
echo "====================="

GOPATH=$(go env GOPATH)
LINT_BINARY="$GOPATH/bin/golangci-lint"

# Check if golangci-lint is installed and executable
if [ ! -x "$LINT_BINARY" ]; then
    echo "❌ golangci-lint not found or not executable."
    echo "Please install it from: https://golangci-lint.run/usage/install/"
    exit 1
fi

echo "✅ golangci-lint found"

# Run the linter
echo "Running golangci-lint..."
$LINT_BINARY run ./...