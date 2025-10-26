package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	Env            string
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	RateLimit      int
	CacheTTL       int
	SupabaseURL    string
	SupabaseKey    string
	PaystackSecret string
	AWSRegion      string
	AWSAccessKey   string
	AWSSecretKey   string
	S3Bucket       string
	SMTPHost       string
	SMTPPort       string
	SMTPUser       string
	SMTPPass       string
	// QoreIDClientID string
	// QoreIDSecret   string
	PremblyAPIKey  string
}

func Load() *Config {
	godotenv.Load()

	rateLimit, _ := strconv.Atoi(getEnv("RATE_LIMIT", "100"))
	cacheTTL, _ := strconv.Atoi(getEnv("CACHE_TTL", "300"))

	return &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("ENV", "development"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		RateLimit:      rateLimit,
		CacheTTL:       cacheTTL,
		SupabaseURL:    getEnv("SUPABASE_URL", ""),
		SupabaseKey:    getEnv("SUPABASE_ANON_KEY", ""),
		PaystackSecret: getEnv("PAYSTACK_SECRET_KEY", ""),
		AWSRegion:      getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKey:   getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey:   getEnv("AWS_SECRET_ACCESS_KEY", ""),
		S3Bucket:       getEnv("S3_BUCKET", ""),
		SMTPHost:       getEnv("SMTP_HOST", ""),
		SMTPPort:       getEnv("SMTP_PORT", "587"),
		SMTPUser:       getEnv("SMTP_USER", ""),
		SMTPPass:       getEnv("SMTP_PASS", ""),
		// QoreIDClientID: getEnv("QOREID_CLIENT_ID", ""),
		// QoreIDSecret:   getEnv("QOREID_SECRET_KEY", ""),
		PremblyAPIKey:  getEnv("PREMBLY_API_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}