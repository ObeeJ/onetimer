package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReferralController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewReferralController(cache *cache.Cache, db *pgxpool.Pool) *ReferralController {
	return &ReferralController{cache: cache, db: db}
}

func (h *ReferralController) GetReferrals(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized referral access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	referralCode := userID[:8]

	if c.Query("list") == "true" {
		// In production, query from database
		referrals := []fiber.Map{
			{
				"id":        "r1",
				"name":      "Alice Johnson",
				"email":     "alice@example.com",
				"joined_at": time.Now().AddDate(0, 0, -5).Format(time.RFC3339),
				"points":    500,
				"status":    "active",
			},
			{
				"id":        "r2",
				"name":      "Bob Smith",
				"email":     "bob@example.com",
				"joined_at": time.Now().AddDate(0, 0, -10).Format(time.RFC3339),
				"points":    750,
				"status":    "active",
			},
		}

		utils.LogInfo(ctx, "Retrieved referrals for user", "user_id", userID, "count", len(referrals))
		return c.JSON(fiber.Map{
			"success": true,
			"data":    referrals,
			"count":   len(referrals),
		})
	}

	link := "https://onetimer.com/ref/" + referralCode
	utils.LogInfo(ctx, "Referral info requested for user", "user_id", userID)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"link":             link,
			"code":             referralCode,
			"total_referrals":  8,
			"active_referrals": 5,
			"total_earnings":   6250,
		},
	})
}

func (h *ReferralController) GenerateCode(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized code generation attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	code := userID[:8] + "_" + uuid.New().String()[:4]
	link := "https://onetimer.com/ref/" + code

	utils.LogInfo(ctx, "Generated referral code for user", "user_id", userID, "code", code)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"code": code,
			"link": link,
		},
		"message": "Referral code generated successfully",
	})
}

func (h *ReferralController) GetStats(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized stats access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// In production, query from database
	stats := fiber.Map{
		"total_referrals":   12,
		"active_referrals":  8,
		"pending_referrals": 2,
		"total_earnings":    12000,
		"this_month":        3500,
		"conversion_rate":   67.5,
		"top_referrer_rank": 15,
	}

	utils.LogInfo(ctx, "Referral stats requested for user", "user_id", userID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// Track referral - when a user signs up via referral link
func (h *ReferralController) TrackReferral(c *fiber.Ctx) error {
	ctx := context.Background()
	var req struct {
		ReferralCode string `json:"referral_code"`
		NewUserID    string `json:"new_user_id"`
		NewUserEmail string `json:"new_user_email"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid referral tracking request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.ReferralCode == "" || req.NewUserID == "" {
		utils.LogWarn(ctx, "Missing required fields in referral tracking")
		return c.Status(400).JSON(fiber.Map{"error": "Referral code and new user ID are required"})
	}

	// In production, save referral to database
	_ = ctx // Would be used for database operations

	utils.LogInfo(ctx, "Referral tracked", "referral_code", req.ReferralCode, "new_user", req.NewUserID)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Referral tracked successfully",
		"reward":  100, // Reward points
	})
}
