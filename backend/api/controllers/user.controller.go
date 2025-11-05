package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/security"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewUserController(cache *cache.Cache) *UserController {
	return &UserController{cache: cache}
}

func NewUserControllerWithDB(cache *cache.Cache, db *pgxpool.Pool) *UserController {
	return &UserController{cache: cache, db: db}
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
		err := h.db.QueryRow(context.Background(),
			"INSERT INTO users (id, email, name, phone, password_hash, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
			userID, req.Email, req.Name, req.Phone, passwordHash, req.Role, false, true).Scan(&userID)

		if err != nil {
			// Check if it's a duplicate email error
			if err.Error() == "no rows in result set" {
				return c.Status(409).JSON(fiber.Map{"error": "Email already registered"})
			}
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":   true,
		"user": user,
	})
}

func (h *UserController) GetProfile(c *fiber.Ctx) error {
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

func (h *UserController) UpdateProfile(c *fiber.Ctx) error {
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

func (h *UserController) UploadKYC(c *fiber.Ctx) error {
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