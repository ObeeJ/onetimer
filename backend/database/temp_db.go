package database

import (
	"context"

	"log"
	"onetimer-backend/utils"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/lib/pq"
)

func InitTempDB() *pgxpool.Pool {
	// Use SQLite for temporary database
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/onetimer_temp?sslmode=disable"
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return nil
	}

	// Test connection
	if err := pool.Ping(context.Background()); err != nil {
		log.Printf("Database ping failed: %v", err)
		return nil
	}

	// Run migrations
	if err := runMigrations(pool); err != nil {
		log.Printf("Migration failed: %v", err)
	}

	// Seed data
	seedData(pool)

	return pool
}

func runMigrations(pool *pgxpool.Pool) error {
	migrations := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		name TEXT NOT NULL,
		phone TEXT,
		password_hash TEXT NOT NULL DEFAULT '',
		role TEXT NOT NULL DEFAULT 'filler',
		is_verified BOOLEAN DEFAULT TRUE,
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS surveys (
		id TEXT PRIMARY KEY,
		creator_id TEXT,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		category TEXT NOT NULL,
		target_audience TEXT,
		estimated_time INTEGER NOT NULL,
		reward INTEGER NOT NULL,
		status TEXT DEFAULT 'active',
		max_responses INTEGER DEFAULT 100,
		current_responses INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS questions (
		id TEXT PRIMARY KEY,
		survey_id TEXT NOT NULL,
		type TEXT NOT NULL,
		text TEXT NOT NULL,
		options TEXT,
		required BOOLEAN DEFAULT TRUE,
		order_num INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS responses (
		id TEXT PRIMARY KEY,
		survey_id TEXT NOT NULL,
		user_id TEXT NOT NULL,
		answers TEXT NOT NULL,
		status TEXT DEFAULT 'completed',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS earnings (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		amount INTEGER NOT NULL,
		source TEXT NOT NULL,
		status TEXT DEFAULT 'completed',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS waitlist (
		id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
		email TEXT UNIQUE NOT NULL,
		source TEXT DEFAULT 'hero_section',
		notified BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
	CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
	`

	_, err := pool.Exec(context.Background(), migrations)
	return err
}

func seedData(pool *pgxpool.Pool) {
	// Check if data exists
	var count int
	pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM surveys").Scan(&count)
	if count > 0 {
		return
	}

	// Seed surveys with proper UUIDs
	surveys := []map[string]interface{}{
		{"id": "550e8400-e29b-41d4-a716-446655440001", "creator_id": "550e8400-e29b-41d4-a716-446655550001", "title": "Consumer Preferences Study", "description": "Help brands understand your shopping habits and preferences.", "category": "lifestyle", "estimated_time": 5, "reward": 200},
		{"id": "550e8400-e29b-41d4-a716-446655440002", "creator_id": "550e8400-e29b-41d4-a716-446655550001", "title": "Technology Usage Survey", "description": "Share your experience with modern technology and digital services.", "category": "tech", "estimated_time": 8, "reward": 300},
		{"id": "550e8400-e29b-41d4-a716-446655440003", "creator_id": "550e8400-e29b-41d4-a716-446655550001", "title": "Health & Wellness Survey", "description": "Tell us about your health and wellness routines.", "category": "health", "estimated_time": 6, "reward": 250},
		{"id": "550e8400-e29b-41d4-a716-446655440004", "creator_id": "550e8400-e29b-41d4-a716-446655550001", "title": "Financial Habits Survey", "description": "Share insights about your financial planning and spending.", "category": "finance", "estimated_time": 10, "reward": 400},
	}

	for _, s := range surveys {
		pool.Exec(context.Background(),
			"INSERT INTO surveys (id, creator_id, title, description, category, estimated_time, reward, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			s["id"], s["creator_id"], s["title"], s["description"], s["category"], s["estimated_time"], s["reward"], "active")
	}

	// Seed questions for survey 1
	questions := []map[string]interface{}{
		{"id": "f47ac10b-58cc-4372-a567-0e02b2c3d401", "survey_id": "550e8400-e29b-41d4-a716-446655440001", "type": "single", "text": "What is your age group?", "options": "18-25,26-35,36-45,46-55,55+", "order_num": 1},
		{"id": "f47ac10b-58cc-4372-a567-0e02b2c3d402", "survey_id": "550e8400-e29b-41d4-a716-446655440001", "type": "multi", "text": "Which factors influence your purchasing decisions?", "options": "Price,Quality,Brand reputation,Reviews,Convenience", "order_num": 2},
		{"id": "f47ac10b-58cc-4372-a567-0e02b2c3d403", "survey_id": "550e8400-e29b-41d4-a716-446655440001", "type": "text", "text": "Describe your typical shopping experience.", "options": "", "order_num": 3},
		{"id": "f47ac10b-58cc-4372-a567-0e02b2c3d404", "survey_id": "550e8400-e29b-41d4-a716-446655440001", "type": "rating", "text": "Rate your satisfaction with online shopping.", "options": "5", "order_num": 4},
	}

	for _, q := range questions {
		pool.Exec(context.Background(),
			"INSERT INTO questions (id, survey_id, type, text, options, order_num) VALUES ($1, $2, $3, $4, $5, $6)",
			q["id"], q["survey_id"], q["type"], q["text"], q["options"], q["order_num"])
	}

	// Seed user with hashed password
	// Password: password123
	passwordHash, _ := utils.HashPassword("password123")
	userID := "550e8400-e29b-41d4-a716-446655550001"
	pool.Exec(context.Background(),
		"INSERT INTO users (id, email, name, phone, password_hash, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		userID, "john@example.com", "John Doe", "+234 801 234 5678", passwordHash, "filler", true, true)

	// Seed earnings
	earnings := []map[string]interface{}{
		{"id": "a47ac10b-58cc-4372-a567-0e02b2c3d401", "user_id": userID, "amount": 300, "source": "Survey #1 - Consumer Preferences"},
		{"id": "a47ac10b-58cc-4372-a567-0e02b2c3d402", "user_id": userID, "amount": 450, "source": "Survey #2 - Technology Usage"},
		{"id": "a47ac10b-58cc-4372-a567-0e02b2c3d403", "user_id": userID, "amount": 1000, "source": "Referral Bonus"},
	}

	for _, e := range earnings {
		pool.Exec(context.Background(),
			"INSERT INTO earnings (id, user_id, amount, source) VALUES ($1, $2, $3, $4)",
			e["id"], e["user_id"], e["amount"], e["source"])
	}
}
