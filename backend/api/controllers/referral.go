package controllers

import (
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ReferralHandler struct {
	cache *cache.Cache
}

func NewReferralHandler(cache *cache.Cache) *ReferralHandler {
	return &ReferralHandler{cache: cache}
}

func (h *ReferralHandler) GetReferrals(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	if c.Query("list") == "true" {
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
		return c.JSON(fiber.Map{"users": referrals})
	}

	link := "https://onetime.com/ref/" + userID[:8]
	return c.JSON(fiber.Map{
		"link":           link,
		"code":           userID[:8],
		"total_referrals": 8,
		"active_referrals": 5,
		"total_earnings":  6250,
	})
}

func (h *ReferralHandler) GenerateCode(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	code := userID[:8] + "_" + uuid.New().String()[:4]
	
	return c.JSON(fiber.Map{
		"ok":   true,
		"code": code,
		"link": "https://onetime.com/ref/" + code,
	})
}

func (h *ReferralHandler) GetStats(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)
	
	stats := fiber.Map{
		"total_referrals":    12,
		"active_referrals":   8,
		"pending_referrals":  2,
		"total_earnings":     12000,
		"this_month":         3500,
		"conversion_rate":    67.5,
		"top_referrer_rank":  15,
	}

	return c.JSON(stats)
}