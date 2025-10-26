.PHONY: build test lint clean run dev docker-build docker-run

# Variables
BINARY_NAME=onetimer-backend
MAIN_PATH=./cmd/onetimer-backend
BUILD_DIR=./build
DOCKER_IMAGE=onetimer-backend

# Build
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)

# Development
dev:
	@echo "Starting development server..."
	@go run $(MAIN_PATH)/main.go

run: build
	@echo "Running $(BINARY_NAME)..."
	@$(BUILD_DIR)/$(BINARY_NAME)

# Testing
test:
	@echo "Running tests..."
	@go test -v ./tests/...

test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./tests/...
	@go tool cover -html=coverage.out -o coverage.html

test-integration:
	@echo "Running integration tests..."
	@go test -v -tags=integration ./tests/...

# Linting
lint:
	@echo "Running linter..."
	@golangci-lint run

lint-fix:
	@echo "Running linter with auto-fix..."
	@golangci-lint run --fix

# Database
db-migrate:
	@echo "Running database migrations..."
	@psql $(DATABASE_URL) -f ./database/migrations.sql

db-seed:
	@echo "Seeding database..."
	@go run ./scripts/seed.go

# Docker
docker-build:
	@echo "Building Docker image..."
	@docker build -t $(DOCKER_IMAGE) .

docker-run:
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

# Utilities
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html

deps:
	@echo "Installing dependencies..."
	@go mod download
	@go mod tidy

format:
	@echo "Formatting code..."
	@go fmt ./...
	@goimports -w .

# Security
security-scan:
	@echo "Running security scan..."
	@gosec ./...

# Performance
benchmark:
	@echo "Running benchmarks..."
	@go test -bench=. -benchmem ./tests/...

# Help
help:
	@echo "Available commands:"
	@echo "  build          - Build the application"
	@echo "  dev            - Start development server"
	@echo "  run            - Build and run the application"
	@echo "  test           - Run all tests"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  lint           - Run linter"
	@echo "  lint-fix       - Run linter with auto-fix"
	@echo "  db-migrate     - Run database migrations"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  clean          - Clean build artifacts"
	@echo "  deps           - Install dependencies"
	@echo "  format         - Format code"
	@echo "  security-scan  - Run security scan"
	@echo "  benchmark      - Run performance benchmarks"