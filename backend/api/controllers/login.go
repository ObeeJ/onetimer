package controllers

import (
	"errors"
	"onetimer-backend/cache"
	"onetimer-backend/repository"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
)

type LoginHandler struct {
	cache     *cache.Cache
	jwtSecret string
	userRepo  *repository.UserRepository
}

func NewLoginHandler(cache *cache.Cache, jwtSecret string, userRepo *repository.UserRepository) *LoginHandler {
	return &LoginHandler{
		cache:     cache,
		jwtSecret: jwtSecret,
		userRepo:  userRepo,
	}
}

func (h *LoginHandler) Login(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	user, err := h.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate JWT token
	token, err := h.generateToken(user.ID.String(), user.Role)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	// Set secure cookies
	security.SetAuthCookie(c, token)
	security.SetSecureCookie(c, "user_role", user.Role, 24*time.Hour)  // Add role cookie
	csrfToken := security.SetCSRFCookie(c)

	return c.JSON(fiber.Map{
		"ok":         true,
		"token":      token,
		"csrf_token": csrfToken,
		"user":       user,
	})
}

func (h *LoginHandler) generateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
