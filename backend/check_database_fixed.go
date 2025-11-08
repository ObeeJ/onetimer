package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

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

	// Check surveys table with correct column names
	fmt.Println("\n📊 SURVEYS TABLE:")
	rows, err := conn.Query(context.Background(), `
		SELECT id, title, description, category, status, created_at 
		FROM surveys 
		ORDER BY created_at DESC 
		LIMIT 5
	`)
	if err != nil {
		log.Printf("Error querying surveys: %v", err)
	} else {
		defer rows.Close()
		count := 0
		for rows.Next() {
			var id, title, description, category, status string
			var createdAt time.Time
			
			err := rows.Scan(&id, &title, &description, &category, &status, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("Survey %d:\n", count+1)
			fmt.Printf("  ID: %s\n", id)
			fmt.Printf("  Title: %s\n", title)
			fmt.Printf("  Description: %s\n", description)
			fmt.Printf("  Category: %s\n", category)
			fmt.Printf("  Status: %s\n", status)
			fmt.Printf("  Created: %s\n", createdAt.Format("2006-01-02 15:04:05"))
			fmt.Println()
			count++
		}
		if count == 0 {
			fmt.Println("  No surveys found")
		}
	}

	// Check users table
	fmt.Println("👤 USERS TABLE:")
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
		count := 0
		for rows2.Next() {
			var id, email, name, role string
			var isVerified bool
			var createdAt time.Time
			
			err := rows2.Scan(&id, &email, &name, &role, &isVerified, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("User %d:\n", count+1)
			fmt.Printf("  ID: %s\n", id)
			fmt.Printf("  Email: %s\n", email)
			fmt.Printf("  Name: %s\n", name)
			fmt.Printf("  Role: %s\n", role)
			fmt.Printf("  Verified: %t\n", isVerified)
			fmt.Printf("  Created: %s\n", createdAt.Format("2006-01-02 15:04:05"))
			fmt.Println()
			count++
		}
		if count == 0 {
			fmt.Println("  No users found")
		}
	}

	// Check waitlist table
	fmt.Println("📧 WAITLIST TABLE:")
	rows3, err := conn.Query(context.Background(), `
		SELECT id, email, source, created_at 
		FROM waitlist 
		ORDER BY created_at DESC 
		LIMIT 3
	`)
	if err != nil {
		log.Printf("Error querying waitlist: %v", err)
	} else {
		defer rows3.Close()
		count := 0
		for rows3.Next() {
			var id, email, source string
			var createdAt time.Time
			
			err := rows3.Scan(&id, &email, &source, &createdAt)
			if err != nil {
				log.Printf("Error scanning row: %v", err)
				continue
			}
			
			fmt.Printf("Waitlist %d:\n", count+1)
			fmt.Printf("  ID: %s\n", id)
			fmt.Printf("  Email: %s\n", email)
			fmt.Printf("  Source: %s\n", source)
			fmt.Printf("  Created: %s\n", createdAt.Format("2006-01-02 15:04:05"))
			fmt.Println()
			count++
		}
		if count == 0 {
			fmt.Println("  No waitlist entries found")
		}
	}

	fmt.Println("✅ Database verification complete!")
}