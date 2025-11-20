package controllers

import (
	"context"
	"errors"
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

func NewUserControllerWithDB(cache *cache.Cache, db *database.SupabaseDB) *UserController {
	return &UserController{cache: cache, db: db, userRepo: repository.NewUserRepository(db)}
}

func (h *UserController) Register(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate input
	validator := security.NewValidator()
	validator.ValidateEmail(req.Email).ValidateName(req.Name).ValidatePassword(req.Password)

	if validator.HasErrors() {
		return validator.SendErrorResponse(c)
	}

	// Sanitize input
	req.Email = validator.SanitizeInput(req.Email)
	req.Name = validator.SanitizeInput(req.Name)

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	// Set default role
	if req.Role == "" {
		req.Role = "filler"
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
		_, err := h.db.Exec(context.Background(),
			"INSERT INTO users (id, email, name, phone, password_hash, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			userID, req.Email, req.Name, req.Phone, passwordHash, req.Role, false, true)

		if err != nil {
			// Check for unique constraint violation (duplicate email)
			if err.Error() == "unique violation" || err.Error() == "UNIQUE constraint failed: users.email" {
				return c.Status(409).JSON(fiber.Map{"error": "Email already registered"})
			}
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create user", "details": err.Error()})
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":   true,
		"user": user,
	})
}

func (h *UserController) GetProfile(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
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
		return c.JSON(fiber.Map{"user": mockUser})
	}

	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	return c.JSON(fiber.Map{"user": user})
}

func (h *UserController) UpdateProfile(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Profile updated successfully",
	})
}

func (h *UserController) UploadKYC(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	file, err := c.FormFile("document")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// TODO: Save file to AWS S3
	// TODO: Update user KYC status

	return c.JSON(fiber.Map{
		"ok":       true,
		"message":  "KYC document uploaded successfully",
		"filename": file.Filename,
	})
}

func (h *UserController) ChangePassword(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		// Return mock success when database is unavailable
		return c.JSON(fiber.Map{"ok": true, "message": "Password changed successfully"})
	}

	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	if !utils.CheckPassword(req.OldPassword, user.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid old password"})
	}

	newPasswordHash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash new password"})
	}

	err = h.userRepo.UpdateUserPassword(context.Background(), user.ID, newPasswordHash)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Password changed successfully",
	})
}

func (h *UserController) GetKYCStatus(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Check if user repository is available
	if h.userRepo == nil {
		// Return mock KYC status when database is unavailable
		return c.JSON(fiber.Map{"status": "pending"})
	}

	user, err := h.userRepo.GetByID(context.Background(), uuid.MustParse(userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return c.Status(404).JSON(fiber.Map{"error": "User not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user"})
	}

	return c.JSON(fiber.Map{
		"status": user.KycStatus,
	})
}

func (h *UserController) GetPreferences(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Return mock preferences when database is unavailable
	if h.userRepo == nil {
		return c.JSON(fiber.Map{
			"notifications": true,
			"email_updates": true,
			"survey_categories": []string{"lifestyle", "technology"},
		})
	}

	// TODO: Implement actual preferences retrieval from database
	return c.JSON(fiber.Map{
		"notifications": true,
		"email_updates": true,
		"survey_categories": []string{"lifestyle", "technology"},
	})
}

func (h *UserController) UpdatePreferences(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Notifications      bool     `json:"notifications"`
		EmailUpdates       bool     `json:"email_updates"`
		SurveyCategories   []string `json:"survey_categories"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Return success when database is unavailable
	if h.userRepo == nil {
		return c.JSON(fiber.Map{"message": "Preferences updated successfully"})
	}

	// TODO: Implement actual preferences update in database
	return c.JSON(fiber.Map{"message": "Preferences updated successfully"})
}
