package main

import (
	"log"
	"onetimer-backend/api/middleware"
	"onetimer-backend/api/routes"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/database"
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
	cacheInstance := cache.NewRedisCache(cfg.RedisURL, cfg.CacheTTL)

	// Initialize database - DATABASE_URL is required
	if cfg.DatabaseURL == "" {
		log.Fatal("❌ DATABASE_URL environment variable is required")
	}

	// Connect to Supabase PostgreSQL database
	supabaseDB, err := database.NewSupabaseConnection(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	log.Println("✅ Database connected successfully")
	if err := supabaseDB.InitSchema(); err != nil {
		log.Printf("⚠️ Schema initialization failed: %v", err)
	}

	dbPool := supabaseDB.Pool

	// Initialize services
	emailService := services.NewEmailService(cfg)
	paystackService := services.NewPaystackService(cfg.PaystackSecret)
	storageService, err := services.NewStorageService(cfg)
	if err != nil {
		log.Printf("⚠️ Storage service initialization failed: %v (uploads will use local storage)", err)
		storageService = nil
	} else {
		log.Println("✅ Storage service initialized successfully")
	}

	// Initialize rate limiter
	rateLimiter, err := middleware.NewRateLimiter(cfg.RedisURL)
	if err != nil {
		log.Printf("⚠️ Rate limiter initialization failed: %v (rate limiting disabled)", err)
		rateLimiter = nil
	} else {
		log.Println("✅ Rate limiter initialized successfully")
	}

	// Initialize WebSocket Hub
	wsHub := services.NewHub()
	go wsHub.Run()
	log.Println("✅ WebSocket hub initialized")

	// Setup routes
	routes.SetupRoutes(app, cacheInstance, cfg, dbPool, emailService, paystackService, storageService, rateLimiter, wsHub)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}