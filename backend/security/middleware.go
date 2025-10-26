package security

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Security headers middleware
func SecurityHeaders() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Generate nonce for CSP
		nonce := generateNonce()
		
		// Security headers
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		
		// Content Security Policy
		csp := strings.Join([]string{
			"default-src 'self'",
			"script-src 'self' 'nonce-" + nonce + "'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self'",
			"connect-src 'self'",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		}, "; ")
		c.Set("Content-Security-Policy", csp)
		
		c.Locals("nonce", nonce)
		return c.Next()
	}
}

// Rate limiting with IP tracking
func RateLimitMiddleware(maxRequests int, window time.Duration) fiber.Handler {
	requests := make(map[string][]time.Time)
	
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		now := time.Now()
		
		// Clean old requests
		if times, exists := requests[ip]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if now.Sub(t) < window {
					validTimes = append(validTimes, t)
				}
			}
			requests[ip] = validTimes
		}
		
		// Check rate limit
		if len(requests[ip]) >= maxRequests {
			return c.Status(429).JSON(fiber.Map{
				"error": "Rate limit exceeded",
				"retry_after": window.Seconds(),
			})
		}
		
		// Add current request
		requests[ip] = append(requests[ip], now)
		
		return c.Next()
	}
}

// Input sanitization middleware
func SanitizeInput() fiber.Handler {
	return func(c *fiber.Ctx) error {
		validator := NewValidator()
		
		// Sanitize query parameters
		c.Request().URI().QueryArgs().VisitAll(func(key, value []byte) {
			sanitized := validator.SanitizeInput(string(value))
			c.Request().URI().QueryArgs().Set(string(key), sanitized)
		})
		
		return c.Next()
	}
}

// Enhanced CSRF protection with cookie validation
func CSRFProtection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Method() == "GET" || c.Method() == "HEAD" || c.Method() == "OPTIONS" {
			return c.Next()
		}
		
		// Get CSRF token from header
		headerToken := c.Get("X-CSRF-Token")
		// Get CSRF token from cookie
		cookieToken := c.Cookies("csrf_token")
		
		if headerToken == "" || cookieToken == "" {
			return c.Status(403).JSON(fiber.Map{"error": "CSRF token required"})
		}
		
		// Validate tokens match (double submit cookie pattern)
		if headerToken != cookieToken || len(headerToken) < 32 {
			return c.Status(403).JSON(fiber.Map{"error": "Invalid CSRF token"})
		}
		
		return c.Next()
	}
}

// Request size limiter with additional security
func RequestSizeLimit(maxSize int64) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Request().Header.ContentLength() > int(maxSize) {
			return c.Status(413).JSON(fiber.Map{"error": "Request too large"})
		}
		
		// Block suspicious user agents
		userAgent := c.Get("User-Agent")
		if containsSuspiciousPatterns(userAgent) {
			return c.Status(403).JSON(fiber.Map{"error": "Blocked"})
		}
		
		return c.Next()
	}
}

// Check for suspicious patterns in user agent
func containsSuspiciousPatterns(userAgent string) bool {
	suspiciousPatterns := []string{"sqlmap", "nikto", "nmap", "masscan", "<script", "javascript:"}
	for _, pattern := range suspiciousPatterns {
		if strings.Contains(strings.ToLower(userAgent), pattern) {
			return true
		}
	}
	return false
}

func generateNonce() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}