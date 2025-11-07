package security

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Secure cookie configuration
func SetSecureCookie(c *fiber.Ctx, name, value string, maxAge time.Duration) {
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(maxAge.Seconds()),
		Path:     "/",
		Domain:   "",
		Secure:   true,
		HTTPOnly: true,
		SameSite: "Strict",
	})
}

// Set authentication token in secure cookie
func SetAuthCookie(c *fiber.Ctx, token string) {
	SetSecureCookie(c, "auth_token", token, 24*time.Hour)
}

// Set CSRF token in cookie
func SetCSRFCookie(c *fiber.Ctx) string {
	token := generateSecureToken()
	SetSecureCookie(c, "csrf_token", token, 24*time.Hour)
	return token
}

// Get secure cookie value
func GetSecureCookie(c *fiber.Ctx, name string) string {
	return c.Cookies(name)
}

// Clear secure cookie
func ClearSecureCookie(c *fiber.Ctx, name string) {
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
	})
}

// Generate secure random token
func generateSecureToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// Cookie-based authentication middleware
func CookieAuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Try cookie first, then Authorization header
		token := GetSecureCookie(c, "auth_token")
		if token == "" {
			authHeader := c.Get("Authorization")
			if authHeader != "" {
				token = authHeader[7:] // Remove "Bearer "
			}
		}

		if token == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Authentication required"})
		}

		// Validate token (same JWT validation logic)
		c.Locals("token", token)
		return c.Next()
	}
}
