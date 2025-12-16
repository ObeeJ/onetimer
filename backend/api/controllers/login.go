package controllers

import (
	"context"
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
	ctx := context.Background()
	utils.LogInfo(ctx, "→ LOGIN request initiated", "client_ip", c.IP(), "method", c.Method())

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		// Don't log the raw error as it may contain sensitive data (passwords)
		utils.LogWarn(ctx, "❌ Failed to parse login request body", "error_type", "body_parse_error", "client_ip", c.IP())
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request format",
			"code":  "PARSE_ERROR",
		})
	}

	utils.LogInfo(ctx, "📧 Attempting login with email", "email", req.Email, "client_ip", c.IP())

	// Nil-safety check for userRepo
	if h.userRepo == nil {
		utils.LogError(ctx, "❌ User repository not initialized - database connection failed", nil, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{
			"error": "Authentication service temporarily unavailable",
			"code":  "SERVICE_UNAVAILABLE",
		})
	}

	user, err := h.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.LogWarn(ctx, "⚠️ Login attempt with non-existent email", "email", req.Email, "client_ip", c.IP())
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid email or password",
				"code":  "INVALID_CREDENTIALS",
			})
		}
		utils.LogError(ctx, "❌ Database error during user lookup", err, "email", req.Email, "client_ip", c.IP())
		return c.Status(500).JSON(fiber.Map{
			"error": "Unable to process login. Please try again.",
			"code":  "DB_ERROR",
		})
	}

	utils.LogInfo(ctx, "✅ User found in database", "user_id", user.ID.String(), "email", req.Email)

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		utils.LogWarn(ctx, "⚠️ Login attempt with incorrect password", "email", req.Email, "client_ip", c.IP(), "user_id", user.ID.String())
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid email or password",
			"code":  "INVALID_CREDENTIALS",
		})
	}

	utils.LogInfo(ctx, "✅ Password verified successfully", "email", req.Email, "user_id", user.ID.String())

	// CRITICAL: Clear any existing auth cookies before setting new ones
	// This prevents cookie conflicts when switching between roles (e.g., filler → super-admin)
	utils.LogInfo(ctx, "🗑️ Clearing any existing authentication cookies to prevent role conflicts...")
	security.ClearSecureCookie(c, "auth_token")
	security.ClearSecureCookie(c, "user_role")
	security.ClearSecureCookie(c, "csrf_token")
	utils.LogInfo(ctx, "✅ Old cookies cleared, ready to set new session")

	// Generate JWT token
	token, err := h.generateToken(user.ID.String(), user.Role)
	if err != nil {
		utils.LogError(ctx, "❌ Failed to generate JWT token", err, "user_id", user.ID.String(), "email", req.Email)
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not establish session. Please try again.",
			"code":  "TOKEN_GENERATION_FAILED",
		})
	}

	utils.LogInfo(ctx, "🔐 JWT token generated successfully", "user_id", user.ID.String(), "token_length", len(token), "role", user.Role)

	// Set secure cookies
	utils.LogInfo(ctx, "🍪 Setting authentication cookies...")
	security.SetAuthCookie(c, token)
	security.SetSecureCookie(c, "user_role", user.Role, 24*time.Hour)
	csrfToken := security.SetCSRFCookie(c)

	utils.LogInfo(ctx, "✅ All cookies prepared for response",
		"auth_cookie", "set",
		"role_cookie", "set",
		"csrf_cookie", "set",
		"user_id", user.ID.String(),
		"email", req.Email,
	)

	utils.LogInfo(ctx, "← LOGIN completed successfully",
		"user_id", user.ID.String(),
		"email", req.Email,
		"role", user.Role,
		"client_ip", c.IP(),
	)

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
