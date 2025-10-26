package controllers

import (
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
)

type BillingController struct {
	billingService *services.BillingService
}

func NewBillingController() *BillingController {
	return &BillingController{
		billingService: services.NewBillingService(),
	}
}

func (bc *BillingController) CalculateCost(c *fiber.Ctx) error {
	var req services.SurveyBilling
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request data",
			"success": false,
		})
	}

	result, err := bc.billingService.CalculateSurveyCost(req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   err.Error(),
			"success": false,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func (bc *BillingController) ValidateReward(c *fiber.Ctx) error {
	var req struct {
		Pages         int `json:"pages"`
		RewardPerUser int `json:"reward_per_user"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request data",
			"success": false,
		})
	}

	err := bc.billingService.ValidateRewardRange(req.Pages, req.RewardPerUser)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   err.Error(),
			"success": false,
			"valid":   false,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"valid":   true,
		"message": "Reward amount is valid for this survey complexity",
	})
}

func (bc *BillingController) GetPricingTiers(c *fiber.Ctx) error {
	tiers := []fiber.Map{
		{
			"level":             "Basic",
			"pages":             "1-5",
			"duration":          "2-5 mins",
			"platform_fee":      150,
			"reward_range":      "₦100 - ₦150",
			"min_reward":        100,
			"max_reward":        150,
		},
		{
			"level":             "Standard",
			"pages":             "6-10",
			"duration":          "5-10 mins",
			"platform_fee":      300,
			"reward_range":      "₦150 - ₦250",
			"min_reward":        150,
			"max_reward":        250,
		},
		{
			"level":             "Advanced",
			"pages":             "11-20",
			"duration":          "10-20 mins",
			"platform_fee":      500,
			"reward_range":      "₦300 - ₦500",
			"min_reward":        300,
			"max_reward":        500,
		},
		{
			"level":             "Enterprise",
			"pages":             "20+",
			"duration":          "20+ mins",
			"platform_fee":      1000,
			"reward_range":      "₦600 - ₦1000",
			"min_reward":        600,
			"max_reward":        1000,
		},
	}

	addOns := []fiber.Map{
		{
			"name":        "Priority Placement",
			"description": "Display survey at top of dashboard for 48 hours",
			"cost":        500,
		},
		{
			"name":        "Targeted Demographics",
			"description": "Filter by location, age, or gender",
			"cost":        200,
			"per":         "filter",
		},
		{
			"name":        "Extended Duration",
			"description": "Keep survey active beyond 7 days",
			"cost":        100,
			"per":         "day",
		},
		{
			"name":        "Data Export",
			"description": "Access CSV/Excel export of all responses",
			"cost":        300,
		},
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"tiers":    tiers,
		"add_ons":  addOns,
	})
}