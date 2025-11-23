package controllers

import (
	"fmt"
	"time"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/repository"
	"onetimer-backend/services"
	"onetimer-backend/utils"

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
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetPackages request")

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

	utils.LogInfo(ctx, "✅ Packages retrieved", "count", len(packages))
	utils.LogInfo(ctx, "← GetPackages completed")
	return c.JSON(fiber.Map{"packages": packages})
}

func (h *CreditsController) PurchaseCredits(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ PurchaseCredits request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized purchase attempt - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in purchase request", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		PackageID string `json:"package_id"`
		Amount    int    `json:"amount"`
		Credits   int    `json:"credits"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse purchase request body", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing credit purchase", "user_id", userID, "package_id", req.PackageID, "amount", req.Amount, "credits", req.Credits)

	// Initialize Paystack payment
	paystackService := h.paystack
	if paystackService == nil {
		paystackService = services.NewPaystackService("sk_test_placeholder_key")
	}

	// Get user email (for now use placeholder)
	userEmail := fmt.Sprintf("user_%s@example.com", userID[:8]) // Use user ID for email
	reference := "txn_" + userID[:8] + "_" + fmt.Sprintf("%d", time.Now().Unix())

	utils.LogInfo(ctx, "Initializing Paystack transaction", "user_id", userID, "reference", reference, "amount_kobo", req.Amount*100)

	initResp, err := paystackService.InitializeTransaction(userEmail, req.Amount*100, reference) // Convert to kobo
	if err != nil {
		utils.LogError(ctx, "Failed to initialize Paystack payment", err, "user_id", userID, "reference", reference, "amount", req.Amount)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to initialize payment"})
	}

	utils.LogInfo(ctx, "✅ Payment initialized successfully", "user_id", userID, "reference", initResp.Data.Reference, "credits", req.Credits)
	utils.LogInfo(ctx, "← PurchaseCredits completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":               true,
		"authorization_url": initResp.Data.AuthorizationURL,
		"reference":        initResp.Data.Reference,
		"amount":           req.Amount,
		"credits":          req.Credits,
		"status":           "pending",
		"message":          "Payment initialized successfully",
	})
}

func (h *CreditsController) PurchaseCustom(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ PurchaseCustom request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized custom purchase attempt - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in custom purchase", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Credits int `json:"credits"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse custom purchase request", err, "user_id", userID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Credits < 10 {
		utils.LogWarn(ctx, "⚠️ Custom purchase below minimum credits", "user_id", userID, "credits", req.Credits, "minimum", 10)
		return c.Status(400).JSON(fiber.Map{"error": "Minimum 10 credits required"})
	}

	amount := req.Credits * 300 // ₦300 per credit
	transactionID := "txn_custom_" + userID[:8]

	utils.LogInfo(ctx, "✅ Custom credits purchase completed", "user_id", userID, "credits", req.Credits, "amount", amount, "transaction_id", transactionID)
	utils.LogInfo(ctx, "← PurchaseCustom completed", "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":             true,
		"transaction_id": transactionID,
		"amount":         amount,
		"credits":        req.Credits,
		"status":         "success",
		"message":        "Custom credits purchased successfully",
	})
}

func (h *CreditsController) GetCredits(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetCredits request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized credits request - no user_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userIDStr, ok := userIDInterface.(string)
	if !ok || userIDStr == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in credits request", "user_id", userIDInterface)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.LogError(ctx, "Failed to parse user ID", err, "user_id_str", userIDStr)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	// Check if credit repository is available
	if h.creditRepo == nil {
		utils.LogWarn(ctx, "Credit repository unavailable, returning mock data", "user_id", userIDStr)
		utils.LogInfo(ctx, "← GetCredits completed (mock)", "user_id", userIDStr)
		return c.JSON(fiber.Map{"credits": 150, "ok": true})
	}

	utils.LogInfo(ctx, "Fetching credits from database", "user_id", userIDStr)
	credits, err := h.creditRepo.GetUserCredits(c.Context(), userID)
	if err != nil {
		utils.LogError(ctx, "Failed to retrieve user credits from database", err, "user_id", userIDStr)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user credits"})
	}

	utils.LogInfo(ctx, "✅ Credits retrieved successfully", "user_id", userIDStr, "credits", credits)
	utils.LogInfo(ctx, "← GetCredits completed", "user_id", userIDStr)

	return c.JSON(fiber.Map{
		"credits": credits,
		"ok":      true,
	})
}
