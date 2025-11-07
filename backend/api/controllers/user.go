package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserHandler struct {
	cache *cache.Cache
}

func NewUserHandler(cache *cache.Cache) *UserHandler {
	return &UserHandler{cache: cache}
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
		Password string `json:"password"`
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

	_, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		ID:         uuid.New(),
		Email:      req.Email,
		Name:       req.Name,
		Role:       req.Role,
		IsVerified: false,
		IsActive:   true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":   true,
		"user": user,
	})
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	user := models.User{
		ID:         uuid.MustParse(userID),
		Email:      "user@example.com",
		Name:       "John Doe",
		Role:       "filler",
		IsVerified: true,
		IsActive:   true,
	}

	return c.JSON(fiber.Map{"user": user})
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

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

func (h *UserHandler) UploadKYC(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

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

func (h *UserHandler) ChangePassword(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Get user from database
	// TODO: Check if old password is correct
	// TODO: Hash new password
	// TODO: Update password in database

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Password changed successfully",
	})
}

func (h *UserHandler) GetKYCStatus(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

	// TODO: Get KYC status from database

	return c.JSON(fiber.Map{
		"status": "not_submitted",
	})
}
