package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func JWTMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Try cookie first, then Authorization header
		tokenString := c.Cookies("auth_token")
		if tokenString == "" {
			authHeader := c.Get("Authorization")
			if authHeader == "" {
				return c.Status(401).JSON(fiber.Map{"error": "Authentication required"})
			}
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				return c.Status(401).JSON(fiber.Map{"error": "Invalid authorization format"})
			}
		}

		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
		}

		claims := token.Claims.(*Claims)
		c.Locals("user_id", claims.UserID)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("role").(string)
		
		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}
		
		return c.Status(403).JSON(fiber.Map{"error": "Insufficient permissions"})
	}
}