package main

import (
	"log"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/database"
	"onetimer-backend/api/routes"
	"onetimer-backend/services"
	"os"

	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize Fiber app
	app := routes.New()

	// Middleware
	app.Use(recover.New())

	// Initialize cache
	cacheInstance := cache.NewCache()

	// Initialize temporary database
	db := database.InitTempDB()
	if db != nil {
		log.Println("✅ Temporary database connected successfully")
	} else {
		log.Println("⚠️ Running without database - using mock data")
	}

	// Initialize services
	emailService := services.NewEmailService(cfg)
	paystackService := services.NewPaystackService(cfg.PaystackSecret)

	// Setup routes
	routes.SetupRoutes(app, cacheInstance, cfg, db, emailService, paystackService)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}