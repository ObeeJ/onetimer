package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
)

type CreditsController struct {
	cache    *cache.Cache
	paystack *services.PaystackService
}

func NewCreditsController(cache *cache.Cache, cfg *config.Config) *CreditsController {
	return &CreditsController{
		cache:    cache,
		paystack: services.NewPaystackService(cfg.PaystackSecret),
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
	userID := c.Locals("user_id").(string)
	
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
	userID := c.Locals("user_id").(string)
	
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