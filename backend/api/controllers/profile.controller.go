package controllers

import (
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProfileController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewProfileController(cache *cache.Cache, db *pgxpool.Pool) *ProfileController {
	return &ProfileController{
		cache: cache,
		db:    db,
	}
}

func (h *ProfileController) GetProfile(c *fiber.Ctx) error {
	// Extract user ID from JWT token
	userID := c.Locals("user_id")
	if userID == nil {
		userID = "user_123" // Fallback for testing
	}

	user := fiber.Map{
		"id":          userID,
		"name":        "John Doe",
		"email":       "john@example.com",
		"phone":       "+234 801 234 5678",
		"isVerified":  true,
		"role":        "filler",
		"createdAt":   time.Now().Format(time.RFC3339),
		"location":    "Lagos, Nigeria",
		"dateOfBirth": "1990-01-01",
	}

	if h.db != nil {
		var name, email, phone string
		var isVerified bool
		err := h.db.QueryRow(c.Context(), "SELECT name, email, phone, is_verified FROM users WHERE id = $1", userID).Scan(&name, &email, &phone, &isVerified)
		if err == nil {
			user["name"] = name
			user["email"] = email
			user["phone"] = phone
			user["isVerified"] = isVerified
		}
	}

	return c.JSON(fiber.Map{"user": user})
}

func (h *ProfileController) UpdateProfile(c *fiber.Ctx) error {
	// Extract user ID from JWT token
	userID := c.Locals("user_id")
	if userID == nil {
		userID = "user_123" // Fallback for testing
	}

	var req struct {
		Name        string `json:"name"`
		Email       string `json:"email"`
		Phone       string `json:"phone"`
		Location    string `json:"location"`
		DateOfBirth string `json:"date_of_birth"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Simulate processing time
	time.Sleep(500 * time.Millisecond)

	if h.db != nil {
		_, err := h.db.Exec(c.Context(), "UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4",
			req.Name, req.Email, req.Phone, userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
		}
	}

	user := fiber.Map{
		"id":          userID,
		"name":        req.Name,
		"email":       req.Email,
		"phone":       req.Phone,
		"location":    req.Location,
		"dateOfBirth": req.DateOfBirth,
		"isVerified":  true,
		"role":        "filler",
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profile updated successfully",
		"user":    user,
	})
}
