package main

import (
	"log"
	"onetimer-backend/api/middleware"
	"onetimer-backend/api/routes"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/database"
	"onetimer-backend/observability"
	"onetimer-backend/services"
	"os"

	sentryfiber "github.com/getsentry/sentry-go/fiber"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg := config.Load()
	log.Printf("DATABASE_URL: %s", cfg.DatabaseURL)

	// Initialize Sentry with production-ready configuration
	if err := observability.InitSentry(observability.SentryConfig{
		DSN:         cfg.SentryDSN,
		Environment: cfg.Env,
		Release:     cfg.SentryRelease,
		ServerName:  cfg.SentryServerName,
		Debug:       cfg.Env == "development",
	}); err != nil {
		log.Printf("⚠️ Sentry initialization failed: %v", err)
	}

	// Initialize Fiber app
	app := routes.New()

	// Sentry Middleware
	if cfg.SentryDSN != "" {
		app.Use(sentryfiber.New(sentryfiber.Options{
			Repanic:         true,
			WaitForDelivery: true,
		}))

		// Enhanced Sentry event middleware
		app.Use(func(ctx *fiber.Ctx) error {
			if hub := sentryfiber.GetHubFromContext(ctx); hub != nil {
				hub.Scope().SetTag("environment", cfg.Env)
				hub.Scope().SetTag("method", ctx.Method())
				hub.Scope().SetTag("path", ctx.Path())
			}
			return ctx.Next()
		})
	}

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
		log.Printf("Database ping failed: %v", err)
		log.Println("Running without database - using mock data")
		supabaseDB = nil
	} else {
		log.Println("Database connected successfully")
		if err := supabaseDB.InitSchema(); err != nil {
			log.Printf("Schema initialization failed: %v", err)
		}
	}

	// Initialize services
	emailService := services.NewEmailService(cfg)
	paystackService := services.NewPaystackService(cfg.PaystackSecret)
	storageService, err := services.NewStorageService(cfg.AWSRegion, cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, cfg.S3Bucket)
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
	routes.SetupRoutes(app, cacheInstance, cfg, supabaseDB, emailService, paystackService, storageService, rateLimiter, wsHub)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
