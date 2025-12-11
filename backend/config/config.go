package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Env                string
	DatabaseURL        string
	RedisURL           string
	JWTSecret          string
	RateLimit          int
	CacheTTL           int
	SupabaseURL        string
	SupabaseKey        string
	PaystackSecret     string
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	S3Bucket           string
	S3Endpoint         string
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPass           string
	
	// SendGrid
	SendGridAPIKey     string
	SendGridFromEmail  string
	SendGridFromName   string

	// MailerSend
	MailerSendAPIKey   string
	EmailFrom          string

	// KYC
	PremblyAPIKey   string

	// Sentry
	SentryDSN       string
	SentryRelease   string
	SentryServerName string
}

func Load() *Config {
	godotenv.Load()

	rateLimit, _ := strconv.Atoi(getEnv("RATE_LIMIT", "100"))
	cacheTTL, _ := strconv.Atoi(getEnv("CACHE_TTL", "300"))
	


	return &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                getEnv("ENV", "development"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		RedisURL:           getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:          getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		RateLimit:          rateLimit,
		CacheTTL:           cacheTTL,
		SupabaseURL:        getEnv("SUPABASE_URL", ""),
		SupabaseKey:        getEnv("SUPABASE_ANON_KEY", ""),
		PaystackSecret:     getEnv("PAYSTACK_SECRET_KEY", ""),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		S3Bucket:           getEnv("S3_BUCKET", ""),
		S3Endpoint:         getEnv("S3_ENDPOINT", ""),
		SMTPHost:           getEnv("SMTP_HOST", ""),
		SMTPPort:           getEnv("SMTP_PORT", "587"),
		SMTPUser:           getEnv("SMTP_USER", ""),		SMTPPass:           getEnv("SMTP_PASS", ""),
		
		// SendGrid
		SendGridAPIKey:     getEnv("SENDGRID_API_KEY", ""),
		SendGridFromEmail:  getEnv("SENDGRID_FROM_EMAIL", "noreply@onetimer.com"),
		SendGridFromName:   getEnv("SENDGRID_FROM_NAME", "OneTime Survey"),

		// MailerSend
		MailerSendAPIKey:   getEnv("MAILERSEND_API_KEY", ""),
		EmailFrom:          getEnv("EMAIL_FROM", "noreply@onetimesurvey.xyz"),

		// KYC
		PremblyAPIKey:    getEnv("PREMBLY_API_KEY", ""),

		// Sentry
		SentryDSN:        getEnv("SENTRY_DSN", ""),
		SentryRelease:    getEnv("SENTRY_RELEASE", "onetimer-backend@dev"),
		SentryServerName: getEnv("SENTRY_SERVER_NAME", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
