package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SuperAdminHandler struct {
	cache *cache.Cache
}

func NewSuperAdminHandler(cache *cache.Cache) *SuperAdminHandler {
	return &SuperAdminHandler{cache: cache}
}

func (h *SuperAdminHandler) GetAdmins(c *fiber.Ctx) error {
	admins := []models.User{
		{
			ID:        uuid.New(),
			Email:     "admin1@onetime.com",
			Name:      "Admin User 1",
			Role:      "admin",
			IsActive:  true,
			CreatedAt: time.Now().AddDate(0, -2, 0),
		},
		{
			ID:        uuid.New(),
			Email:     "admin2@onetime.com",
			Name:      "Admin User 2",
			Role:      "admin",
			IsActive:  false,
			CreatedAt: time.Now().AddDate(0, -1, 0),
		},
	}

	return c.JSON(fiber.Map{"admins": admins})
}

func (h *SuperAdminHandler) CreateAdmin(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	admin := models.User{
		ID:        uuid.New(),
		Email:     req.Email,
		Name:      req.Name,
		Role:      "admin",
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":    true,
		"admin": admin,
	})
}

func (h *SuperAdminHandler) GetFinancials(c *fiber.Ctx) error {
	financials := fiber.Map{
		"total_revenue":      15000000,
		"total_payouts":      8500000,
		"platform_fees":      2250000,
		"monthly_revenue":    1200000,
		"monthly_payouts":    650000,
		"pending_withdrawals": 125000,
		"active_surveys":     245,
		"total_users":        12500,
	}

	return c.JSON(financials)
}

func (h *SuperAdminHandler) GetAuditLogs(c *fiber.Ctx) error {
	logs := []fiber.Map{
		{
			"id":        uuid.New().String(),
			"action":    "user_approved",
			"admin_id":  uuid.New().String(),
			"target_id": uuid.New().String(),
			"timestamp": time.Now().AddDate(0, 0, -1),
			"details":   "KYC approved for user",
		},
		{
			"id":        uuid.New().String(),
			"action":    "survey_rejected",
			"admin_id":  uuid.New().String(),
			"target_id": uuid.New().String(),
			"timestamp": time.Now().AddDate(0, 0, -2),
			"details":   "Survey content violation",
		},
	}

	return c.JSON(fiber.Map{"logs": logs})
}

func (h *SuperAdminHandler) GetSystemSettings(c *fiber.Ctx) error {
	settings := fiber.Map{
		"platform_fee_percentage": 15.0,
		"min_withdrawal_amount":   1000,
		"max_survey_reward":       5000,
		"kyc_required":            true,
		"auto_approve_surveys":    false,
		"maintenance_mode":        false,
	}

	return c.JSON(settings)
}

func (h *SuperAdminHandler) UpdateSettings(c *fiber.Ctx) error {
	var settings map[string]interface{}
	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"message":  "Settings updated successfully",
		"settings": settings,
	})
}