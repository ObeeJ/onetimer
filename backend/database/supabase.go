package database

import (
	"context"
	"fmt"
	"log"
	"onetimer-backend/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SupabaseDB struct {
	*pgxpool.Pool
	config *config.Config
}

func NewSupabaseConnection(cfg *config.Config) (*SupabaseDB, error) {
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	supabaseDB := &SupabaseDB{
		Pool:   pool,
		config: cfg,
	}

	return supabaseDB, nil
}

func (db *SupabaseDB) InitSchema() error {
	schema := `
	-- Enable UUID extension
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		email VARCHAR(255) UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL,
		role VARCHAR(50) NOT NULL DEFAULT 'filler',
		password_hash VARCHAR(255),
		phone VARCHAR(20),
		date_of_birth DATE,
		gender VARCHAR(10),
		location VARCHAR(255),
		is_verified BOOLEAN DEFAULT FALSE,
		is_active BOOLEAN DEFAULT TRUE,
		kyc_status VARCHAR(50) DEFAULT 'pending',
		profile_picture_url TEXT,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	-- Surveys table
	CREATE TABLE IF NOT EXISTS surveys (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(500) NOT NULL,
		description TEXT NOT NULL,
		category VARCHAR(100),
		reward_amount INTEGER NOT NULL DEFAULT 0,
		estimated_duration INTEGER DEFAULT 5,
		target_responses INTEGER DEFAULT 100,
		current_responses INTEGER DEFAULT 0,
		status VARCHAR(50) DEFAULT 'draft',
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW(),
		expires_at TIMESTAMP
	);

	-- Questions table
	CREATE TABLE IF NOT EXISTS questions (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		title TEXT NOT NULL,
		description TEXT,
		required BOOLEAN DEFAULT FALSE,
		options JSONB,
		order_index INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Responses table
	CREATE TABLE IF NOT EXISTS responses (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
		filler_id UUID REFERENCES users(id) ON DELETE CASCADE,
		answers JSONB NOT NULL,
		status VARCHAR(50) DEFAULT 'completed',
		started_at TIMESTAMP DEFAULT NOW(),
		completed_at TIMESTAMP,
		quality_score INTEGER DEFAULT 0
	);

	-- Earnings table
	CREATE TABLE IF NOT EXISTS earnings (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		survey_id UUID REFERENCES surveys(id) ON DELETE SET NULL,
		amount INTEGER NOT NULL,
		type VARCHAR(50) NOT NULL,
		status VARCHAR(50) DEFAULT 'pending',
		description TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Withdrawals table
	CREATE TABLE IF NOT EXISTS withdrawals (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		amount INTEGER NOT NULL,
		bank_name VARCHAR(255),
		account_number VARCHAR(50),
		account_name VARCHAR(255),
		bank_code VARCHAR(10),
		paystack_reference VARCHAR(255),
		status VARCHAR(50) DEFAULT 'pending',
		created_at TIMESTAMP DEFAULT NOW(),
		processed_at TIMESTAMP
	);

	-- Referrals table
	CREATE TABLE IF NOT EXISTS referrals (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
		referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
		code VARCHAR(50) NOT NULL,
		status VARCHAR(50) DEFAULT 'active',
		earnings INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Credits table
	CREATE TABLE IF NOT EXISTS credits (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		amount INTEGER NOT NULL,
		type VARCHAR(50) NOT NULL,
		description TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- User profiles table
	CREATE TABLE IF NOT EXISTS user_profiles (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		age_range VARCHAR(20),
		gender VARCHAR(20),
		country VARCHAR(100),
		state VARCHAR(100),
		location VARCHAR(255),
		education VARCHAR(100),
		employment VARCHAR(100),
		income_range VARCHAR(50),
		interests JSONB,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	-- Payment transactions table
	CREATE TABLE IF NOT EXISTS payment_transactions (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		type VARCHAR(50) NOT NULL,
		amount INTEGER NOT NULL,
		credits INTEGER DEFAULT 0,
		status VARCHAR(50) DEFAULT 'pending',
		paystack_reference VARCHAR(255),
		description TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Audit logs table
	CREATE TABLE IF NOT EXISTS audit_logs (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE SET NULL,
		action VARCHAR(255) NOT NULL,
		resource VARCHAR(255),
		details JSONB,
		ip_address INET,
		user_agent TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Waitlist table for landing page email collection
	CREATE TABLE IF NOT EXISTS waitlist (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		email VARCHAR(255) UNIQUE NOT NULL,
		source VARCHAR(100) DEFAULT 'hero_section',
		notified BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT NOW()
	);

	-- Create indexes for performance
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
	CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
	CREATE INDEX IF NOT EXISTS idx_surveys_creator ON surveys(creator_id);
	CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
	CREATE INDEX IF NOT EXISTS idx_responses_survey ON responses(survey_id);
	CREATE INDEX IF NOT EXISTS idx_responses_filler ON responses(filler_id);
	CREATE INDEX IF NOT EXISTS idx_responses_started_at ON responses(started_at);
	CREATE INDEX IF NOT EXISTS idx_earnings_user ON earnings(user_id);
	CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
	CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
	CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
	CREATE INDEX IF NOT EXISTS idx_credits_user ON credits(user_id);
	CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
	CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
	CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
	CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
	CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
	CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
	`

	_, err := db.Exec(context.Background(), schema)
	if err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Println("✅ Database schema initialized successfully")
	return nil
}

func (db *SupabaseDB) SeedData() error {
	// Insert sample data for development/testing
	seedSQL := `
	-- Insert sample users
	INSERT INTO users (email, name, role, is_verified, is_active) VALUES
	('admin@onetimer.com', 'Admin User', 'admin', true, true),
	('creator@onetimer.com', 'Creator User', 'creator', true, true),
	('filler@onetimer.com', 'Filler User', 'filler', true, true)
	ON CONFLICT (email) DO NOTHING;

	-- Insert sample surveys
	INSERT INTO surveys (creator_id, title, description, category, reward_amount, target_responses, status) 
	SELECT 
		u.id,
		'Consumer Behavior Study',
		'Help us understand consumer preferences and shopping habits',
		'lifestyle',
		500,
		100,
		'active'
	FROM users u WHERE u.role = 'creator' LIMIT 1
	ON CONFLICT DO NOTHING;
	`

	_, err := db.Exec(context.Background(), seedSQL)
	if err != nil {
		log.Printf("Warning: Failed to seed data: %v", err)
	} else {
		log.Println("✅ Sample data seeded successfully")
	}

	return nil
}
