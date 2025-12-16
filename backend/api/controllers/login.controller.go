package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LoginController struct {
	cache     *cache.Cache
	db        *pgxpool.Pool
	jwtSecret string
}

func NewLoginController(cache *cache.Cache, db *pgxpool.Pool, jwtSecret string) *LoginController {
	return &LoginController{
		cache:     cache,
		db:        db,
		jwtSecret: jwtSecret,
	}
}

func (h *LoginController) Login(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and password are required"})
	}

	// Get user from database
	var userID, name, role, storedHash string
	var isVerified, isActive bool

	if h.db != nil {
		err := h.db.QueryRow(context.Background(),
			"SELECT id, name, password_hash, role, is_verified, is_active FROM users WHERE email = $1",
			req.Email).Scan(&userID, &name, &storedHash, &role, &isVerified, &isActive)

		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		// Check if account is active
		if !isActive {
			return c.Status(403).JSON(fiber.Map{"error": "Account is inactive"})
		}
	} else {
		// Fallback for when database is not available
		return c.Status(500).JSON(fiber.Map{"error": "Database unavailable"})
	}

	// Verify password
	if !utils.CheckPassword(req.Password, storedHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// CRITICAL: Clear any existing auth cookies before setting new ones
	// This prevents cookie conflicts when switching between roles
	security.ClearSecureCookie(c, "auth_token")
	security.ClearSecureCookie(c, "user_role")
	security.ClearSecureCookie(c, "csrf_token")

	// Generate JWT token
	token, err := h.generateToken(userID, role)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	// Set secure cookies
	security.SetAuthCookie(c, token)
	csrfToken := security.SetCSRFCookie(c)

	return c.JSON(fiber.Map{
		"ok":         true,
		"token":      token,
		"csrf_token": csrfToken,
		"user": fiber.Map{
			"id":         userID,
			"email":      req.Email,
			"name":       name,
			"role":       role,
			"isVerified": isVerified,
		},
	})
}

func (h *LoginController) generateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
