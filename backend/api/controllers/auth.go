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

type AuthHandler struct {
	cache     *cache.Cache
	jwtSecret string
}

func NewAuthHandler(cache *cache.Cache, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		cache:     cache,
		jwtSecret: jwtSecret,
	}
}

func (h *AuthHandler) SendOTP(c *fiber.Ctx) error {
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
		"created_at": time.Now(),
	}
	h.cache.Set(c.Context(), key, otpData)

	// TODO: Send OTP via email service (Supabase Auth or SMTP)

	return c.JSON(fiber.Map{
		"ok":         true,
		"channel":    "email",
		"expires_in": 300, // 5 minutes
	})
}

func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Verify OTP from cache
	key := "otp:" + req.Email
	var otpData fiber.Map
	if err := h.cache.Get(c.Context(), key, &otpData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid or expired OTP"})
	}

	// Check OTP expiry
	otpService := services.NewOTPService()
	createdAt, _ := time.Parse(time.RFC3339, otpData["created_at"].(string))
	if otpService.IsExpired(createdAt) {
		h.cache.Delete(c.Context(), key)
		return c.Status(400).JSON(fiber.Map{"error": "OTP has expired"})
	}

	if otpData["code"].(string) != req.OTP {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid OTP"})
	}

	// Delete OTP from cache
	h.cache.Delete(c.Context(), key)

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

func (h *AuthHandler) generateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
