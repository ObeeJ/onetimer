package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	
	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(context.Background())

	// Create waitlist table
	_, err = conn.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS waitlist (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			source VARCHAR(100) DEFAULT 'hero_section',
			notified BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`)
	if err != nil {
		log.Fatal("Failed to create waitlist table:", err)
	}

	log.Println("✅ Waitlist table created successfully")
}