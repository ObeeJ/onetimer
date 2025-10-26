package controllers

import (
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"

)

type OnboardingHandler struct {
	cache *cache.Cache
}

func NewOnboardingHandler(cache *cache.Cache) *OnboardingHandler {
	return &OnboardingHandler{cache: cache}
}

func (h *OnboardingHandler) CompleteOnboarding(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	var req struct {
		FirstName    string   `json:"first_name"`
		LastName     string   `json:"last_name"`
		Age          string   `json:"age"`
		Gender       string   `json:"gender"`
		Country      string   `json:"country"`
		State        string   `json:"state"`
		Education    string   `json:"education"`
		Employment   string   `json:"employment"`
		Income       string   `json:"income"`
		Interests    []string `json:"interests"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Save to database
	profile := fiber.Map{
		"user_id":     userID,
		"first_name":  req.FirstName,
		"last_name":   req.LastName,
		"age":         req.Age,
		"gender":      req.Gender,
		"country":     req.Country,
		"state":       req.State,
		"education":   req.Education,
		"employment":  req.Employment,
		"income":      req.Income,
		"interests":   req.Interests,
		"completed_at": time.Now(),
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"profile": profile,
		"message": "Onboarding completed successfully",
	})
}

func (h *OnboardingHandler) CheckEligibility(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)
	_ = c.Query("survey_id")
	
	// TODO: Check user demographics against survey requirements
	eligible := true
	reasons := []string{}

	if !eligible {
		return c.JSON(fiber.Map{
			"eligible": false,
			"reasons":  reasons,
		})
	}

	return c.JSON(fiber.Map{
		"eligible": true,
		"message":  "User is eligible for this survey",
	})
}

func (h *OnboardingHandler) UpdateDemographics(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)
	
	var demographics map[string]interface{}
	if err := c.BodyParser(&demographics); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Update user demographics in database

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Demographics updated successfully",
	})
}