package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type LoginController struct {
	cache     *cache.Cache
	jwtSecret string
}

func NewLoginController(cache *cache.Cache, jwtSecret string) *LoginController {
	return &LoginController{
		cache:     cache,
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

	// TODO: Get user from database
	// Mock user data with hashed password
	storedHash := "$2a$14$example.hash.here" // This would come from DB
	
	if !utils.CheckPassword(req.Password, storedHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate JWT token
	token, err := h.generateToken(uuid.New().String(), "filler")
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
			"id":    uuid.New().String(),
			"email": req.Email,
			"role":  "filler",
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