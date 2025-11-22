package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/repository"
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CreditsController struct {
	cache      *cache.Cache
	paystack   *services.PaystackService
	creditRepo *repository.CreditRepository
}

func NewCreditsController(cache *cache.Cache, cfg *config.Config, creditRepo *repository.CreditRepository) *CreditsController {
	return &CreditsController{
		cache:      cache,
		paystack:   services.NewPaystackService(cfg.PaystackSecret),
		creditRepo: creditRepo,
	}
}

func (h *CreditsController) GetPackages(c *fiber.Ctx) error {
	packages := []fiber.Map{
		{
			"id":          "starter",
			"name":        "Starter Pack",
			"credits":     50,
			"price":       15000,
			"popular":     false,
			"description": "Perfect for small surveys",
		},
		{
			"id":          "professional",
			"name":        "Professional Pack",
			"credits":     150,
			"price":       40000,
			"popular":     true,
			"description": "Most popular choice",
		},
		{
			"id":          "enterprise",
			"name":        "Enterprise Pack",
			"credits":     500,
			"price":       120000,
			"popular":     false,
			"description": "For large-scale research",
		},
	}

	return c.JSON(fiber.Map{"packages": packages})
}

func (h *CreditsController) PurchaseCredits(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		PackageID string `json:"package_id"`
		Amount    int    `json:"amount"`
		Credits   int    `json:"credits"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Initialize Paystack payment
	// For now, return mock success

	return c.JSON(fiber.Map{
		"ok":             true,
		"transaction_id": "txn_" + userID[:8],
		"amount":         req.Amount,
		"credits":        req.Credits,
		"status":         "success",
		"message":        "Credits purchased successfully",
	})
}

func (h *CreditsController) PurchaseCustom(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Credits int `json:"credits"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Credits < 10 {
		return c.Status(400).JSON(fiber.Map{"error": "Minimum 10 credits required"})
	}

	amount := req.Credits * 300 // ₦300 per credit

	return c.JSON(fiber.Map{
		"ok":             true,
		"transaction_id": "txn_custom_" + userID[:8],
		"amount":         amount,
		"credits":        req.Credits,
		"status":         "success",
		"message":        "Custom credits purchased successfully",
	})
}

func (h *CreditsController) GetCredits(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userIDStr, ok := userIDInterface.(string)
	if !ok || userIDStr == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	// Check if credit repository is available
	if h.creditRepo == nil {
		// Return mock credits when database is unavailable
		return c.JSON(fiber.Map{"credits": 150, "ok": true})
	}

	credits, err := h.creditRepo.GetUserCredits(c.Context(), userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user credits"})
	}

	return c.JSON(fiber.Map{
		"credits": credits,
		"ok":      true,
	})
}
