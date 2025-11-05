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
	"github.com/jackc/pgx/v5/pgxpool"
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

	// Initialize database (prefer Supabase if DATABASE_URL is set)
	var dbPool *pgxpool.Pool

	if cfg.DatabaseURL != "" {
		// Use Supabase connection
		supabaseDB, err := database.NewSupabaseConnection(cfg)
		if err != nil {
			log.Printf("⚠️ Supabase connection failed: %v", err)
			log.Println("⚠️ Falling back to local database...")
			dbPool = database.InitTempDB()
		} else {
			log.Println("✅ Supabase database connected successfully")
			if err := supabaseDB.InitSchema(); err != nil {
				log.Printf("⚠️ Schema initialization failed: %v", err)
			}
			dbPool = supabaseDB.Pool
		}
	} else {
		// Fallback to temp database
		log.Println("⚠️ DATABASE_URL not set, using local database")
		dbPool = database.InitTempDB()
	}

	if dbPool != nil {
		log.Println("✅ Database ready")
	} else {
		log.Println("⚠️ Running without database - using mock data")
	}

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