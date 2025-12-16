package middleware

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

type authRateLimiter struct {
	requests map[string][]time.Time
	mu       sync.RWMutex
}

var authLimiter = &authRateLimiter{
	requests: make(map[string][]time.Time),
}

// StrictAuthRateLimit - 10 requests per minute for auth endpoints
func StrictAuthRateLimit() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.Get("x-forwarded-for", c.IP())
		now := time.Now()
		maxRequests := 10
		window := 1 * time.Minute

		authLimiter.mu.Lock()
		defer authLimiter.mu.Unlock()

		// Clean old requests
		if times, exists := authLimiter.requests[ip]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if now.Sub(t) < window {
					validTimes = append(validTimes, t)
				}
			}
			authLimiter.requests[ip] = validTimes
		}

		// Check rate limit
		if len(authLimiter.requests[ip]) >= maxRequests {
			return c.Status(429).JSON(fiber.Map{
				"error":       "Too many authentication attempts",
				"retry_after": int(window.Seconds()),
				"code":        "RATE_LIMIT_EXCEEDED",
			})
		}

		// Add current request
		authLimiter.requests[ip] = append(authLimiter.requests[ip], now)

		return c.Next()
	}
}

// Account lockout after 5 failed attempts
type loginAttempts struct {
	attempts map[string]int
	lockouts map[string]time.Time
	mu       sync.RWMutex
}

var loginTracker = &loginAttempts{
	attempts: make(map[string]int),
	lockouts: make(map[string]time.Time),
}

func AccountLockout() fiber.Handler {
	return func(c *fiber.Ctx) error {
		email := c.FormValue("email")
		if email == "" {
			// Try JSON body
			var body map[string]string
			c.BodyParser(&body)
			email = body["email"]
		}

		if email == "" {
			return c.Next()
		}

		loginTracker.mu.RLock()
		lockoutTime, isLocked := loginTracker.lockouts[email]
		loginTracker.mu.RUnlock()

		// Check if account is locked
		if isLocked && time.Now().Before(lockoutTime) {
			remaining := int(time.Until(lockoutTime).Minutes())
			return c.Status(423).JSON(fiber.Map{
				"error":            "Account temporarily locked",
				"retry_after_mins": remaining,
				"code":             "ACCOUNT_LOCKED",
			})
		}

		// Store email for post-request check
		c.Locals("login_email", email)
		return c.Next()
	}
}

func RecordFailedLogin(email string) {
	loginTracker.mu.Lock()
	defer loginTracker.mu.Unlock()

	loginTracker.attempts[email]++

	// Lock account after 5 failed attempts for 15 minutes
	if loginTracker.attempts[email] >= 5 {
		loginTracker.lockouts[email] = time.Now().Add(15 * time.Minute)
		loginTracker.attempts[email] = 0
	}
}

func ResetLoginAttempts(email string) {
	loginTracker.mu.Lock()
	defer loginTracker.mu.Unlock()

	delete(loginTracker.attempts, email)
	delete(loginTracker.lockouts, email)
}
