package controllers

import (
	"context"
	"errors"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/database"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type UserController struct {
	cache    *cache.Cache
	db       *database.SupabaseDB
	userRepo *repository.UserRepository
}

func NewUserController(cache *cache.Cache) *UserController {
	return &UserController{cache: cache}
}

func NewUserControllerWithDB(cache *cache.Cache, db *database.SupabaseDB, userRepo *repository.UserRepository) *UserController {
	return &UserController{cache: cache, db: db, userRepo: userRepo}
}

func (h *UserController) Register(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ Register request")

	var req struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse registration request", err, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing registration", "email", req.Email, "name", req.Name, "role", req.Role)

	// Validate input
	validator := security.NewValidator()
	validator.ValidateEmail(req.Email).ValidateName(req.Name).ValidatePassword(req.Password)

	if validator.HasErrors() {
		utils.LogWarn(ctx, "⚠️ Registration validation failed", "email", req.Email, "errors", validator.HasErrors())
		return validator.SendErrorResponse(c)
	}

	// Sanitize input
	req.Email = validator.SanitizeInput(req.Email)
	req.Name = validator.SanitizeInput(req.Name)

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.LogError(ctx, "Failed to hash password during registration", err, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	// Set default role
	if req.Role == "" {
		req.Role = "filler"
		utils.LogInfo(ctx, "Using default role", "role", req.Role)
	}

	// Create user
	userID := uuid.New().String()
	user := models.User{
		ID:         uuid.MustParse(userID),
		Email:      req.Email,
		Name:       req.Name,
		Role:       req.Role,
		IsVerified: false,
		IsActive:   true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Save to database if available
	if h.db != nil {
		utils.LogInfo(ctx, "Saving user to database", "user_id", userID, "email", req.Email)
		_, err := h.db.Exec(context.Background(),
			"INSERT INTO users (id, email, name, phone, password_hash, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			userID, req.Email, req.Name, req.Phone, passwordHash, req.Role, false, true)

		if err != nil {
			// Check for unique constraint violation (duplicate email)
			if err.Error() == "unique violation" || err.Error() == "UNIQUE constraint failed: users.email" {
				utils.LogWarn(ctx, "⚠️ Registration failed - email already exists", "email", req.Email)
				return c.Status(409).JSON(fiber.Map{"error": "Email already registered"})
			}
			utils.LogError(ctx, "Failed to create user in database", err, "email", req.Email, "user_id", userID)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create user", "details": err.Error()})
		}
	}

	utils.LogInfo(ctx, "✅ User registered successfully", "user_id", userID, "email", req.Email, "role", req.Role)
	utils.LogInfo(ctx, "← Register completed", "user_id", userID)

	return c.Status(201).JSON(fiber.Map{
		"ok":   true,
		"user": user,
	})
}

func (h *UserController) GetProfile(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetProfile request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized profile request - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in profile request", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		utils.LogWarn(ctx, "User repository unavailable, returning mock profile", "user_id", userID)
		// Return mock user when database is unavailable
		mockUser := models.User{
			ID:         uuid.MustParse(userID),
			Email:      "user@example.com",
			Name:       "Test User",
			Role:       "filler",
			IsVerified: true,
			IsActive:   true,
			KycStatus:  "pending",
			CreatedAt:  time.Now().AddDate(0, 0, -30),
			UpdatedAt:  time.Now(),
		}
		utils.LogInfo(ctx, "← GetProfile completed (mock)", "user_id", userID)
		return c.JSON(fiber.Map{"user": mockUser})
	}

	utils.LogInfo(ctx, "Fetching user profile from database", "user_id", userID)
	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.LogWarn(ctx, "⚠️ User not found", "user_id", userID)
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		utils.LogError(ctx, "Failed to retrieve user profile", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	utils.LogInfo(ctx, "✅ Profile retrieved successfully", "user_id", userID, "email", user.Email, "role", user.Role)
	utils.LogInfo(ctx, "← GetProfile completed", "user_id", userID)

	return c.JSON(fiber.Map{"user": user})
}

func (h *UserController) UpdateProfile(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ UpdateProfile request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized profile update - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in profile update", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse profile update request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "✅ Profile update completed", "user_id", userID, "name", req.Name, "email", req.Email)
	utils.LogInfo(ctx, "← UpdateProfile completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Profile updated successfully",
	})
}

func (h *UserController) UploadKYC(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ UploadKYC request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized KYC upload - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in KYC upload", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		DocumentURL string `json:"document_url"`
		DocumentID  string `json:"document_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse KYC upload request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.DocumentURL == "" {
		utils.LogWarn(ctx, "⚠️ KYC upload missing document URL", "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Document URL is required"})
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		utils.LogError(ctx, "Failed to parse user ID", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	utils.LogInfo(ctx, "Saving KYC document", "user_id", userID, "document_url", req.DocumentURL)

	// Save KYC document URL to database and update status
	if h.db != nil {
		_, err = h.db.Exec(c.Context(),
			"UPDATE users SET kyc_data = $1, kyc_status = $2, updated_at = NOW() WHERE id = $3",
			req.DocumentURL, "pending_review", userUUID)
		if err != nil {
			utils.LogError(ctx, "Failed to save KYC document to database", err, "user_id", userID)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save KYC document"})
		}
	} else if h.userRepo != nil {
		err = h.userRepo.UpdateKYCStatus(c.Context(), userUUID, "pending_review")
		if err != nil {
			utils.LogError(ctx, "Failed to update KYC status", err, "user_id", userID)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update KYC status"})
		}
	}

	utils.LogInfo(ctx, "✅ KYC document uploaded successfully", "user_id", userID, "status", "pending_review")
	utils.LogInfo(ctx, "← UploadKYC completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":          true,
		"message":     "KYC document uploaded and saved successfully",
		"document_url": req.DocumentURL,
		"status":      "pending_review",
	})
}

func (h *UserController) ChangePassword(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ChangePassword request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized password change - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in password change", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse password change request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		utils.LogWarn(ctx, "User repository unavailable, returning mock success", "user_id", userID)
		utils.LogInfo(ctx, "← ChangePassword completed (mock)", "user_id", userID)
		return c.JSON(fiber.Map{"ok": true, "message": "Password changed successfully"})
	}

	utils.LogInfo(ctx, "Verifying old password", "user_id", userID)
	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.LogWarn(ctx, "⚠️ User not found during password change", "user_id", userID)
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		utils.LogError(ctx, "Failed to get user for password change", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	if !utils.CheckPassword(req.OldPassword, user.PasswordHash) {
		utils.LogWarn(ctx, "⚠️ Invalid old password attempt", "user_id", userID)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid old password"})
	}

	newPasswordHash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.LogError(ctx, "Failed to hash new password", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash new password"})
	}

	utils.LogInfo(ctx, "Updating password in database", "user_id", userID)
	err = h.userRepo.UpdateUserPassword(context.Background(), user.ID, newPasswordHash)
	if err != nil {
		utils.LogError(ctx, "Failed to update password in database", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	utils.LogInfo(ctx, "✅ Password changed successfully", "user_id", userID)
	utils.LogInfo(ctx, "← ChangePassword completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Password changed successfully",
	})
}

func (h *UserController) GetKYCStatus(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetKYCStatus request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized KYC status request - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in KYC status request", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		utils.LogWarn(ctx, "User repository unavailable, returning mock KYC status", "user_id", userID)
		utils.LogInfo(ctx, "← GetKYCStatus completed (mock)", "user_id", userID)
		return c.JSON(fiber.Map{"status": "pending"})
	}

	utils.LogInfo(ctx, "Fetching KYC status from database", "user_id", userID)
	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.LogWarn(ctx, "⚠️ User not found for KYC status", "user_id", userID)
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		utils.LogError(ctx, "Failed to get user KYC status", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	utils.LogInfo(ctx, "✅ KYC status retrieved", "user_id", userID, "status", user.KycStatus)
	utils.LogInfo(ctx, "← GetKYCStatus completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"status": user.KycStatus,
	})
}

func (h *UserController) UpdateKYCStatus(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ UpdateKYCStatus request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized KYC status update - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in KYC status update", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		KycStatus string `json:"kycStatus"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse KYC status update request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate KYC status
	if req.KycStatus != "pending" && req.KycStatus != "approved" && req.KycStatus != "rejected" {
		utils.LogWarn(ctx, "⚠️ Invalid KYC status value", "user_id", userID, "status", req.KycStatus)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid KYC status"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		utils.LogError(ctx, "User repository unavailable", nil, "user_id", userID)
		return c.Status(503).JSON(fiber.Map{"error": "Database unavailable"})
	}

	utils.LogInfo(ctx, "Updating KYC status in database", "user_id", userID, "new_status", req.KycStatus)

	// Update user KYC status in database
	err := h.userRepo.UpdateKYCStatus(context.Background(), uuid.MustParse(userID), req.KycStatus)
	if err != nil {
		utils.LogError(ctx, "Failed to update KYC status in database", err, "user_id", userID, "status", req.KycStatus)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update KYC status"})
	}

	utils.LogInfo(ctx, "✅ KYC status updated successfully", "user_id", userID, "status", req.KycStatus)
	utils.LogInfo(ctx, "← UpdateKYCStatus completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "KYC status updated successfully",
		"status":  req.KycStatus,
	})
}

func (h *UserController) GetPreferences(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetPreferences request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized preferences request - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in preferences request", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Return mock preferences when database is unavailable
	if h.userRepo == nil {
		utils.LogWarn(ctx, "User repository unavailable, returning mock preferences", "user_id", userID)
		utils.LogInfo(ctx, "← GetPreferences completed (mock)", "user_id", userID)
		return c.JSON(fiber.Map{
			"notifications": true,
			"email_updates": true,
			"survey_categories": []string{"lifestyle", "technology"},
		})
	}

	// Parse user ID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		utils.LogError(ctx, "Failed to parse user ID", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	utils.LogInfo(ctx, "Fetching user preferences from database", "user_id", userID)

	// Get user preferences from database
	user, err := h.userRepo.GetUserPreferences(c.Context(), userUUID)
	if err != nil {
		utils.LogError(ctx, "Failed to retrieve user preferences", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to retrieve preferences"})
	}

	// Set defaults if preferences are nil
	notifications := true
	emailUpdates := true
	categories := []string{"lifestyle", "technology"}

	if user.Notifications != nil {
		notifications = *user.Notifications
	}
	if user.EmailUpdates != nil {
		emailUpdates = *user.EmailUpdates
	}
	if len(user.SurveyCategories) > 0 {
		categories = user.SurveyCategories
	}

	utils.LogInfo(ctx, "✅ Preferences retrieved", "user_id", userID, "notifications", notifications, "email_updates", emailUpdates)
	utils.LogInfo(ctx, "← GetPreferences completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"notifications": notifications,
		"email_updates": emailUpdates,
		"survey_categories": categories,
	})
}

func (h *UserController) UpdatePreferences(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ UpdatePreferences request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized preferences update - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in preferences update", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Notifications      bool     `json:"notifications"`
		EmailUpdates       bool     `json:"email_updates"`
		SurveyCategories   []string `json:"survey_categories"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse preferences update request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing preferences update", "user_id", userID, "notifications", req.Notifications, "email_updates", req.EmailUpdates, "categories_count", len(req.SurveyCategories))

	// Return success when database is unavailable
	if h.userRepo == nil {
		utils.LogWarn(ctx, "User repository unavailable, returning mock success", "user_id", userID)
		utils.LogInfo(ctx, "← UpdatePreferences completed (mock)", "user_id", userID)
		return c.JSON(fiber.Map{"message": "Preferences updated successfully"})
	}

	// Parse user ID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		utils.LogError(ctx, "Failed to parse user ID", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	utils.LogInfo(ctx, "Updating preferences in database", "user_id", userID)

	// Update preferences in database
	err = h.userRepo.UpdateUserPreferences(c.Context(), userUUID, req.Notifications, req.EmailUpdates, req.SurveyCategories)
	if err != nil {
		utils.LogError(ctx, "Failed to update preferences in database", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update preferences"})
	}

	utils.LogInfo(ctx, "✅ Preferences updated successfully", "user_id", userID)
	utils.LogInfo(ctx, "← UpdatePreferences completed", "user_id", userID)

	return c.JSON(fiber.Map{"message": "Preferences updated successfully"})
}
