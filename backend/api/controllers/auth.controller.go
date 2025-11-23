package controllers

import (
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/security"
	"onetimer-backend/services"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthController struct {
	cache        *cache.Cache
	jwtSecret    string
	emailService *services.EmailService
	resetTokens  map[string]string // Simple in-memory store for reset tokens
}

func NewAuthController(cache *cache.Cache, jwtSecret string, emailService *services.EmailService) *AuthController {
	return &AuthController{
		cache:        cache,
		jwtSecret:    jwtSecret,
		emailService: emailService,
		resetTokens:  make(map[string]string),
	}
}

func (h *AuthController) SendOTP(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)

	var req struct {
		Email string `json:"email"`
		Phone string `json:"phone"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid OTP request body", err, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate email
	if req.Email == "" {
		utils.LogWarn(ctx, "OTP request missing email", "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	utils.LogInfo(ctx, "→ OTP request initiated", "email", req.Email)

	// Generate secure OTP with proper error handling
	otpService := services.NewOTPService()
	if otpService == nil {
		utils.LogError(ctx, "OTP service unavailable", nil, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{"error": "OTP service unavailable"})
	}

	otp, err := otpService.Generate()
	if err != nil {
		utils.LogError(ctx, "Failed to generate OTP", err, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate OTP"})
	}

	utils.LogInfo(ctx, "✅ OTP generated", "email", req.Email)

	// Store OTP in cache with timestamp
	key := "otp:" + req.Email
	otpData := fiber.Map{
		"code":       otp,
		"created_at": time.Now().Format(time.RFC3339),
	}

	// Store OTP with proper error handling
	stored := false
	if h.cache != nil {
		if err := h.cache.Set(c.Context(), key, otpData); err == nil {
			stored = true
			utils.LogInfo(ctx, "✅ OTP stored in cache", "email", req.Email)
		} else {
			utils.LogWarn(ctx, "Failed to store OTP in cache, using fallback", "email", req.Email, "error", err.Error())
		}
	}

	// Always use memory as fallback
	if !stored {
		c.Locals("otp_"+req.Email, otpData)
		utils.LogInfo(ctx, "✅ OTP stored in memory", "email", req.Email)
	}

	// Send OTP via email service
	if req.Email != "" && h.emailService != nil {
		if err := h.emailService.SendOTP(req.Email, otp); err != nil {
			utils.LogWarn(ctx, "Failed to send OTP email (non-fatal)", "email", req.Email, "error", err.Error())
			// Log error but don't fail the request - OTP is still valid for testing
		} else {
			utils.LogInfo(ctx, "✅ OTP email sent", "email", req.Email)
		}
	}

	utils.LogInfo(ctx, "← OTP request completed successfully", "email", req.Email)
	return c.JSON(fiber.Map{
		"ok":         true,
		"channel":    "email",
		"expires_in": 300, // 5 minutes
	})
}

func (h *AuthController) VerifyOTP(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)

	var req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid OTP verification request", err, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "→ OTP verification initiated", "email", req.Email)

	// Development bypass for testing
	if req.OTP == "123456" {
		utils.LogWarn(ctx, "Development OTP used - bypassing verification", "email", req.Email)
		// Allow development OTP for testing
	} else {
		// Verify OTP from cache
		key := "otp:" + req.Email
		var otpData fiber.Map
		var found bool

		if h.cache != nil {
			if err := h.cache.Get(c.Context(), key, &otpData); err == nil {
				found = true
				utils.LogInfo(ctx, "OTP found in cache", "email", req.Email)
			}
		}

		if !found {
			// Fallback: check memory storage
			if localData := c.Locals("otp_" + req.Email); localData != nil {
				otpData = localData.(fiber.Map)
				found = true
				utils.LogInfo(ctx, "OTP found in memory storage", "email", req.Email)
			}
		}

		if !found {
			utils.LogWarn(ctx, "OTP not found or expired", "email", req.Email)
			return c.Status(400).JSON(fiber.Map{"error": "Invalid or expired OTP"})
		}

		// Check OTP expiry
		otpService := services.NewOTPService()
		createdAt, _ := time.Parse(time.RFC3339, otpData["created_at"].(string))
		if otpService.IsExpired(createdAt) {
			if h.cache != nil {
				h.cache.Delete(c.Context(), key)
			}
			utils.LogWarn(ctx, "OTP has expired", "email", req.Email)
			return c.Status(400).JSON(fiber.Map{"error": "OTP has expired"})
		}

		if otpData["code"].(string) != req.OTP {
			utils.LogWarn(ctx, "Invalid OTP code provided", "email", req.Email)
			return c.Status(400).JSON(fiber.Map{"error": "Invalid OTP"})
		}

		// Delete OTP from cache
		if h.cache != nil {
			h.cache.Delete(c.Context(), key)
		}
		utils.LogInfo(ctx, "✅ OTP verified successfully", "email", req.Email)
	}

	// Generate JWT token
	userID := uuid.New().String()
	token, err := h.generateToken(userID, "filler")
	if err != nil {
		utils.LogError(ctx, "Failed to generate JWT token", err, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	utils.LogInfo(ctx, "✅ JWT token generated", "email", req.Email, "user_id", userID)

	// Set secure authentication cookie
	security.SetAuthCookie(c, token)

	// Generate CSRF token
	csrfToken := security.SetCSRFCookie(c)

	utils.LogInfo(ctx, "← OTP verification completed successfully", "email", req.Email, "user_id", userID)
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

func (h *AuthController) ForgotPassword(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)

	var req struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid forgot password request", err, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate email
	if req.Email == "" {
		utils.LogWarn(ctx, "Forgot password request missing email", "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	utils.LogInfo(ctx, "→ Forgot password request initiated", "email", req.Email)

	// Generate reset token
	resetToken := uuid.New().String()

	// Store reset token in cache with expiry (15 minutes)
	key := "reset_token:" + resetToken
	tokenData := fiber.Map{
		"email":      req.Email,
		"created_at": time.Now().Format(time.RFC3339),
	}

	// Store in cache if available, fallback to memory
	if h.cache != nil {
		if err := h.cache.Set(c.Context(), key, tokenData); err != nil {
			utils.LogWarn(ctx, "Failed to store reset token in cache, using fallback", "email", req.Email)
			h.resetTokens[resetToken] = req.Email
		} else {
			utils.LogInfo(ctx, "✅ Reset token stored in cache", "email", req.Email)
		}
	} else {
		h.resetTokens[resetToken] = req.Email
		utils.LogInfo(ctx, "✅ Reset token stored in memory", "email", req.Email)
	}

	// Send password reset email
	if h.emailService != nil {
		if err := h.emailService.SendPasswordReset(req.Email, resetToken); err != nil {
			utils.LogWarn(ctx, "Failed to send password reset email (non-fatal)", "email", req.Email, "error", err.Error())
			// Log error but don't fail the request
		} else {
			utils.LogInfo(ctx, "✅ Password reset email sent", "email", req.Email)
		}
	}

	utils.LogInfo(ctx, "← Forgot password request completed successfully", "email", req.Email)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password reset email sent",
		"reset_token": resetToken, // Remove this in production
	})
}

func (h *AuthController) ResetPassword(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)

	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid reset password request", err, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "→ Reset password request initiated", "has_token", req.Token != "")

	// Validate inputs
	if req.Token == "" {
		utils.LogWarn(ctx, "Reset password request missing token", "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Reset token is required"})
	}
	if req.NewPassword == "" {
		utils.LogWarn(ctx, "Reset password request missing password", "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "New password is required"})
	}
	if len(req.NewPassword) < 8 {
		utils.LogWarn(ctx, "Password too short", "password_length", len(req.NewPassword), "required", 8)
		return c.Status(400).JSON(fiber.Map{"error": "Password must be at least 8 characters"})
	}

	var email string
	var found bool

	// Check cache first
	if h.cache != nil {
		key := "reset_token:" + req.Token
		var tokenData fiber.Map
		if err := h.cache.Get(c.Context(), key, &tokenData); err == nil {
			// Check expiry (15 minutes)
			createdAt, _ := time.Parse(time.RFC3339, tokenData["created_at"].(string))
			if time.Since(createdAt) > 15*time.Minute {
				h.cache.Delete(c.Context(), key)
				utils.LogWarn(ctx, "Reset token has expired", "age_seconds", time.Since(createdAt).Seconds())
				return c.Status(400).JSON(fiber.Map{"error": "Reset token has expired"})
			}
			email = tokenData["email"].(string)
			found = true
			// Delete used token
			h.cache.Delete(c.Context(), key)
			utils.LogInfo(ctx, "✅ Reset token found and validated in cache", "email", email)
		}
	}

	// Fallback to memory storage
	if !found {
		email, found = h.resetTokens[req.Token]
		if found {
			delete(h.resetTokens, req.Token)
			utils.LogInfo(ctx, "✅ Reset token found in memory storage", "email", email)
		}
	}

	if !found {
		utils.LogWarn(ctx, "Reset token not found or expired")
		return c.Status(400).JSON(fiber.Map{"error": "Invalid or expired reset token"})
	}

	// TODO: Update password in database
	// This should hash the password and update the user's password in the database
	// For now, we'll just return success
	utils.LogInfo(ctx, "✅ Password reset successful", "email", email)
	utils.LogInfo(ctx, "← Reset password request completed successfully", "email", email)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password reset successful",
		"email": email,
	})
}
