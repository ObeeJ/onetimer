package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EligibilityController struct {
	cache    *cache.Cache
	db       *pgxpool.Pool
	userRepo *repository.UserRepository
}

func NewEligibilityController(cache *cache.Cache, db *pgxpool.Pool) *EligibilityController {
	var userRepo *repository.UserRepository
	if db != nil {
		userRepo = repository.NewUserRepository(db)
	}
	return &EligibilityController{
		cache:    cache,
		db:       db,
		userRepo: userRepo,
	}
}

func (h *EligibilityController) CheckEligibility(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	if h.userRepo == nil {
		// Mock eligibility check
		return c.JSON(fiber.Map{
			"eligible": true,
			"reasons": []string{},
			"kyc_status": "approved",
			"success": true,
		})
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	user, err := h.userRepo.GetByID(c.Context(), userUUID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found", "success": false})
	}

	eligible := true
	reasons := []string{}

	// Check KYC status
	if user.KYCStatus != "approved" {
		eligible = false
		reasons = append(reasons, "KYC verification required")
	}

	// Check if user is active
	if !user.IsActive {
		eligible = false
		reasons = append(reasons, "Account is inactive")
	}

	// Check if user is verified
	if !user.IsVerified {
		eligible = false
		reasons = append(reasons, "Email verification required")
	}

	return c.JSON(fiber.Map{
		"eligible":   eligible,
		"reasons":    reasons,
		"kyc_status": user.KYCStatus,
		"is_active":  user.IsActive,
		"is_verified": user.IsVerified,
		"success":    true,
	})
}