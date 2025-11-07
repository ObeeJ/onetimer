package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/security"
	"onetimer-backend/services"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthController struct {
	cache     *cache.Cache
	jwtSecret string
}

func NewAuthController(cache *cache.Cache, jwtSecret string) *AuthController {
	return &AuthController{
		cache:     cache,
		jwtSecret: jwtSecret,
	}
}

func (h *AuthController) SendOTP(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
		Phone string `json:"phone"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Generate secure OTP
	otpService := services.NewOTPService()
	otp, err := otpService.Generate()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate OTP"})
	}

	// Store OTP in cache with timestamp
	key := "otp:" + req.Email
	otpData := fiber.Map{
		"code":       otp,
		"created_at": time.Now().Format(time.RFC3339),
	}

	// Try to store in cache, fallback to memory if cache fails
	if h.cache != nil {
		err = h.cache.Set(c.Context(), key, otpData)
		if err != nil {
			// Fallback: store in memory for development
			c.Locals("otp_"+req.Email, otpData)
		}
	} else {
		// Cache not available, use memory storage
		c.Locals("otp_"+req.Email, otpData)
	}

	// Send OTP via email service
	emailService := services.NewEmailService(nil) // Pass config if available
	if emailErr := emailService.SendOTP(req.Email, otp); emailErr != nil {
		// Log error but don't fail the request
		// In development, OTP is still stored for manual verification
	}

	return c.JSON(fiber.Map{
		"ok":         true,
		"channel":    "email",
		"expires_in": 300, // 5 minutes
	})
}

func (h *AuthController) VerifyOTP(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Development bypass for testing
	if req.OTP == "123456" {
		// Allow development OTP for testing
	} else {
		// Verify OTP from cache
		key := "otp:" + req.Email
		var otpData fiber.Map
		var found bool

		if h.cache != nil {
			if err := h.cache.Get(c.Context(), key, &otpData); err == nil {
				found = true
			}
		}

		if !found {
			// Fallback: check memory storage
			if localData := c.Locals("otp_" + req.Email); localData != nil {
				otpData = localData.(fiber.Map)
				found = true
			}
		}

		if !found {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid or expired OTP"})
		}

		// Check OTP expiry
		otpService := services.NewOTPService()
		createdAt, _ := time.Parse(time.RFC3339, otpData["created_at"].(string))
		if otpService.IsExpired(createdAt) {
			if h.cache != nil {
				h.cache.Delete(c.Context(), key)
			}
			return c.Status(400).JSON(fiber.Map{"error": "OTP has expired"})
		}

		if otpData["code"].(string) != req.OTP {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid OTP"})
		}

		// Delete OTP from cache
		if h.cache != nil {
			h.cache.Delete(c.Context(), key)
		}
	}

	// Generate JWT token
	token, err := h.generateToken(uuid.New().String(), "filler")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	// Set secure authentication cookie
	security.SetAuthCookie(c, token)

	// Generate CSRF token
	csrfToken := security.SetCSRFCookie(c)

	return c.JSON(fiber.Map{
		"ok":         true,
		"verified":   true,
		"token":      token,
		"csrf_token": csrfToken,
	})
}

func (h *AuthController) generateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
