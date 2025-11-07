package middleware

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

type RateLimiter struct {
	client *redis.Client
}

func NewRateLimiter(redisURL string) (*RateLimiter, error) {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	client := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RateLimiter{client: client}, nil
}

// RateLimitMiddleware creates a rate limiting middleware
// max: maximum requests allowed
// window: time window duration
func (rl *RateLimiter) RateLimitMiddleware(max int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Generate key based on IP and user (if authenticated)
		key := rl.generateKey(c)

		ctx := context.Background()

		// Use sliding window counter algorithm
		now := time.Now().Unix()

		// Create unique key with current window
		rateLimitKey := fmt.Sprintf("ratelimit:%s:%d", key, now/int64(window.Seconds()))

		// Increment counter
		pipe := rl.client.Pipeline()
		incr := pipe.Incr(ctx, rateLimitKey)
		pipe.Expire(ctx, rateLimitKey, window)

		_, err := pipe.Exec(ctx)
		if err != nil {
			// If Redis fails, allow the request (fail-open for availability)
			return c.Next()
		}

		count := incr.Val()

		// Set rate limit headers
		c.Set("X-RateLimit-Limit", strconv.Itoa(max))
		c.Set("X-RateLimit-Remaining", strconv.Itoa(max-int(count)))
		c.Set("X-RateLimit-Reset", strconv.FormatInt(now+int64(window.Seconds()), 10))

		// Check if limit exceeded
		if count > int64(max) {
			c.Set("Retry-After", strconv.FormatInt(int64(window.Seconds()), 10))
			return c.Status(429).JSON(fiber.Map{
				"error":       "Rate limit exceeded",
				"message":     fmt.Sprintf("Too many requests. Please try again in %v", window),
				"retry_after": int64(window.Seconds()),
			})
		}

		return c.Next()
	}
}

// PerEndpointRateLimit creates endpoint-specific rate limiting
func (rl *RateLimiter) PerEndpointRateLimit() fiber.Handler {
	// Define rate limits per endpoint
	limits := map[string]struct {
		max    int
		window time.Duration
	}{
		// Public endpoints - more restrictive
		"/api/waitlist/join": {max: 5, window: time.Minute},
		"/api/auth/login":    {max: 10, window: time.Minute},
		"/api/auth/register": {max: 5, window: time.Minute},

		// Upload endpoints - moderate limits
		"/api/upload/kyc":          {max: 10, window: time.Hour},
		"/api/upload/survey-media": {max: 20, window: time.Hour},

		// Survey creation - moderate limits
		"/api/creator/surveys": {max: 30, window: time.Hour},

		// Response submission
		"/api/filler/surveys": {max: 100, window: time.Hour},

		// Payment endpoints - strict limits
		"/api/payment/initialize": {max: 5, window: time.Minute},
		"/api/withdrawal/request": {max: 3, window: time.Minute},
	}

	return func(c *fiber.Ctx) error {
		path := c.Path()

		// Check if path has specific limit
		if limit, exists := limits[path]; exists {
			key := rl.generateKey(c)

			ctx := context.Background()
			now := time.Now().Unix()
			rateLimitKey := fmt.Sprintf("ratelimit:%s:%s:%d", path, key, now/int64(limit.window.Seconds()))

			pipe := rl.client.Pipeline()
			incr := pipe.Incr(ctx, rateLimitKey)
			pipe.Expire(ctx, rateLimitKey, limit.window)

			_, err := pipe.Exec(ctx)
			if err != nil {
				return c.Next()
			}

			count := incr.Val()

			c.Set("X-RateLimit-Limit", strconv.Itoa(limit.max))
			c.Set("X-RateLimit-Remaining", strconv.Itoa(limit.max-int(count)))
			c.Set("X-RateLimit-Reset", strconv.FormatInt(now+int64(limit.window.Seconds()), 10))

			if count > int64(limit.max) {
				return c.Status(429).JSON(fiber.Map{
					"error":       "Rate limit exceeded for this endpoint",
					"message":     fmt.Sprintf("Too many requests to %s. Please try again in %v", path, limit.window),
					"retry_after": int64(limit.window.Seconds()),
				})
			}
		}

		return c.Next()
	}
}

// generateKey creates a unique key for rate limiting based on IP and user ID
func (rl *RateLimiter) generateKey(c *fiber.Ctx) string {
	// Try to get user ID from context (if authenticated)
	userID := c.Locals("user_id")
	if userID != nil {
		return fmt.Sprintf("user:%v", userID)
	}

	// Fall back to IP address
	ip := c.IP()
	return fmt.Sprintf("ip:%s", ip)
}

// CheckRateLimit checks if a specific action is rate limited (for custom use)
func (rl *RateLimiter) CheckRateLimit(ctx context.Context, key string, max int, window time.Duration) (allowed bool, remaining int, resetAt int64) {
	now := time.Now().Unix()
	rateLimitKey := fmt.Sprintf("ratelimit:custom:%s:%d", key, now/int64(window.Seconds()))

	count, err := rl.client.Incr(ctx, rateLimitKey).Result()
	if err != nil {
		// On error, allow (fail-open)
		return true, max, now + int64(window.Seconds())
	}

	// Set expiration on first increment
	if count == 1 {
		rl.client.Expire(ctx, rateLimitKey, window)
	}

	remaining = max - int(count)
	if remaining < 0 {
		remaining = 0
	}

	resetAt = now + int64(window.Seconds())
	allowed = count <= int64(max)

	return allowed, remaining, resetAt
}
