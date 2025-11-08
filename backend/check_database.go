package main

import (
	"context"
	"fmt"
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

	fmt.Println("🔍 Checking Supabase Database Contents")
	fmt.Println("=====================================")

	// Check surveys table
	fmt.Println("\n📊 SURVEYS TABLE:")
	rows, err := conn.Query(context.Background(), `
		SELECT id, title, description, category, reward_amount, status, created_at 
		FROM surveys 
		ORDER BY created_at DESC 
		LIMIT 5
	`)
	if err != nil {
		log.Printf("Error querying surveys: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var id, title, description, category, status string
			var reward int
			var createdAt string
			
			err := rows.Scan(&id, &title, &description, &category, &reward, &status, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("ID: %s\n", id)
			fmt.Printf("Title: %s\n", title)
			fmt.Printf("Description: %s\n", description)
			fmt.Printf("Category: %s\n", category)
			fmt.Printf("Reward: ₦%d\n", reward)
			fmt.Printf("Status: %s\n", status)
			fmt.Printf("Created: %s\n", createdAt)
			fmt.Println("---")
		}
	}

	// Check users table
	fmt.Println("\n👤 USERS TABLE:")
	rows2, err := conn.Query(context.Background(), `
		SELECT id, email, name, role, is_verified, created_at 
		FROM users 
		ORDER BY created_at DESC 
		LIMIT 5
	`)
	if err != nil {
		log.Printf("Error querying users: %v", err)
	} else {
		defer rows2.Close()
		for rows2.Next() {
			var id, email, name, role string
			var isVerified bool
			var createdAt string
			
			err := rows2.Scan(&id, &email, &name, &role, &isVerified, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("ID: %s\n", id)
			fmt.Printf("Email: %s\n", email)
			fmt.Printf("Name: %s\n", name)
			fmt.Printf("Role: %s\n", role)
			fmt.Printf("Verified: %t\n", isVerified)
			fmt.Printf("Created: %s\n", createdAt)
			fmt.Println("---")
		}
	}

	// Check responses table
	fmt.Println("\n📝 RESPONSES TABLE:")
	rows3, err := conn.Query(context.Background(), `
		SELECT id, survey_id, filler_id, status, started_at 
		FROM responses 
		ORDER BY started_at DESC 
		LIMIT 3
	`)
	if err != nil {
		log.Printf("Error querying responses: %v", err)
	} else {
		defer rows3.Close()
		for rows3.Next() {
			var id, surveyId, fillerId, status string
			var startedAt string
			
			err := rows3.Scan(&id, &surveyId, &fillerId, &status, &startedAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("Response ID: %s\n", id)
			fmt.Printf("Survey ID: %s\n", surveyId)
			fmt.Printf("Filler ID: %s\n", fillerId)
			fmt.Printf("Status: %s\n", status)
			fmt.Printf("Started: %s\n", startedAt)
			fmt.Println("---")
		}
	}

	// Check waitlist table
	fmt.Println("\n📧 WAITLIST TABLE:")
	rows4, err := conn.Query(context.Background(), `
		SELECT id, email, source, created_at 
		FROM waitlist 
		ORDER BY created_at DESC 
		LIMIT 3
	`)
	if err != nil {
		log.Printf("Error querying waitlist: %v", err)
	} else {
		defer rows4.Close()
		for rows4.Next() {
			var id, email, source, createdAt string
			
			err := rows4.Scan(&id, &email, &source, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("ID: %s\n", id)
			fmt.Printf("Email: %s\n", email)
			fmt.Printf("Source: %s\n", source)
			fmt.Printf("Created: %s\n", createdAt)
			fmt.Println("---")
		}
	}

	fmt.Println("\n✅ Database verification complete!")
}