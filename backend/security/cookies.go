package security

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"onetimer-backend/utils"
)

// Secure cookie configuration
func SetSecureCookie(c *fiber.Ctx, name, value string, maxAge time.Duration) {
	ctx := context.Background()

	// Check ENV variable (matches config.go which loads from ENV not ENVIRONMENT)
	isProduction := os.Getenv("ENV") == "production"

	// Log cookie operation details
	utils.LogInfo(ctx, "🍪 Setting secure cookie",
		"cookie_name", name,
		"max_age_seconds", int(maxAge.Seconds()),
		"is_production", isProduction,
		"secure_flag", isProduction,
		"http_only", true,
		"same_site", "Lax",
		"path", "/",
		"method", c.Method(),
		"path_route", c.Path(),
	)

	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(maxAge.Seconds()),
		Path:     "/",
		Domain:   "",
		Secure:   isProduction,
		HTTPOnly: true,
		SameSite: "Lax",
	})

	utils.LogInfo(ctx, "✅ Secure cookie set successfully", "cookie_name", name)
}

// Set authentication token in secure cookie
func SetAuthCookie(c *fiber.Ctx, token string) {
	ctx := context.Background()
	utils.LogInfo(ctx, "🔐 Setting authentication cookie", "token_length", len(token), "expires_hours", 24)
	SetSecureCookie(c, "auth_token", token, 24*time.Hour)
	utils.LogInfo(ctx, "✅ Auth token cookie prepared for response", "client_ip", c.IP())
}

// Set CSRF token in cookie
func SetCSRFCookie(c *fiber.Ctx) string {
	ctx := context.Background()
	utils.LogInfo(ctx, "🛡️ Generating CSRF token", "method", c.Method(), "path", c.Path())
	token := generateSecureToken()
	utils.LogInfo(ctx, "✅ CSRF token generated", "token_length", len(token))
	SetSecureCookie(c, "csrf_token", token, 24*time.Hour)
	utils.LogInfo(ctx, "✅ CSRF token cookie prepared for response")
	return token
}

// Get secure cookie value
func GetSecureCookie(c *fiber.Ctx, name string) string {
	ctx := context.Background()
	value := c.Cookies(name)
	if value == "" {
		utils.LogWarn(ctx, "⚠️ Cookie not found", "cookie_name", name, "method", c.Method(), "path", c.Path(), "client_ip", c.IP())
	} else {
		utils.LogInfo(ctx, "✅ Cookie retrieved successfully", "cookie_name", name, "value_length", len(value))
	}
	return value
}

// Clear secure cookie
func ClearSecureCookie(c *fiber.Ctx, name string) {
	ctx := context.Background()
	isProduction := os.Getenv("ENV") == "production"

	utils.LogInfo(ctx, "🗑️ Clearing secure cookie",
		"cookie_name", name,
		"method", c.Method(),
		"path", c.Path(),
		"client_ip", c.IP(),
	)

	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		HTTPOnly: true,
		Secure:   isProduction,
		SameSite: "Lax",
	})

	utils.LogInfo(ctx, "✅ Cookie cleared successfully", "cookie_name", name)
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
		ctx := context.Background()
		utils.LogInfo(ctx, "🔍 Cookie authentication middleware triggered",
			"method", c.Method(),
			"path", c.Path(),
			"client_ip", c.IP(),
		)

		// Try cookie first, then Authorization header
		token := GetSecureCookie(c, "auth_token")
		tokenSource := "cookie"

		if token == "" {
			utils.LogWarn(ctx, "⚠️ Auth token cookie not found, checking Authorization header")
			authHeader := c.Get("Authorization")
			if authHeader != "" {
				if len(authHeader) > 7 {
					token = authHeader[7:] // Remove "Bearer "
					tokenSource = "authorization_header"
					utils.LogInfo(ctx, "✅ Token extracted from Authorization header", "token_length", len(token))
				} else {
					utils.LogWarn(ctx, "⚠️ Invalid Authorization header format")
				}
			}
		} else {
			utils.LogInfo(ctx, "✅ Auth token found in cookie", "token_length", len(token))
		}

		if token == "" {
			utils.LogError(ctx, "❌ Authentication failed - no token found",
				nil,
				"method", c.Method(),
				"path", c.Path(),
				"client_ip", c.IP(),
			)
			return c.Status(401).JSON(fiber.Map{
				"error": "Authentication required",
				"code":  "NO_AUTH_TOKEN",
			})
		}

		// Validate token (same JWT validation logic)
		c.Locals("token", token)
		c.Locals("token_source", tokenSource)

		utils.LogInfo(ctx, "✅ Authentication middleware passed",
			"token_source", tokenSource,
			"method", c.Method(),
			"path", c.Path(),
		)

		return c.Next()
	}
}
