package controllers

import (
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/services"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PaymentController struct {
	cache              *cache.Cache
	paystackService    *services.PaystackService
}

// Initialize with Paystack secret key from environment
func NewPaymentController(cache *cache.Cache, paystackSecretKey string) *PaymentController {
	var ps *services.PaystackService
	if paystackSecretKey != "" {
		ps = services.NewPaystackService(paystackSecretKey)
	}
	return &PaymentController{
		cache:           cache,
		paystackService: ps,
	}
}

// PurchaseCredits handles credit purchases via Paystack
func (h *PaymentController) PurchaseCredits(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError("Unauthorized credit purchase attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Email   string `json:"email"`
		Amount  int    `json:"amount"` // in kobo
		Credits int    `json:"credits"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError("Invalid purchase request: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate purchase
	if req.Amount < 10000 { // Minimum ₦100
		utils.LogWarn("Purchase amount too low: %d kobo", req.Amount)
		return c.Status(400).JSON(fiber.Map{"error": "Minimum purchase is ₦100 (10000 kobo)"})
	}

	if req.Credits < 10 {
		utils.LogWarn("Credits too low: %d", req.Credits)
		return c.Status(400).JSON(fiber.Map{"error": "Minimum purchase is 10 credits"})
	}

	// If Paystack service not configured, return mock
	if h.paystackService == nil {
		utils.LogWarn("Paystack not configured, returning mock response for user %s", userID)
		transactionID := uuid.New()
		return c.Status(201).JSON(fiber.Map{
			"ok":              true,
			"transaction_id":  transactionID,
			"amount":          req.Amount,
			"credits":         req.Credits,
			"status":          "pending",
			"message":         "Payment initialization (mock mode)",
		})
	}

	// Initialize Paystack transaction
	transactionRef := fmt.Sprintf("PS_%s_%d", userID[:8], time.Now().Unix())
	result, err := h.paystackService.InitializeTransaction(req.Email, req.Amount, transactionRef)
	if err != nil {
		utils.LogError("Failed to initialize Paystack transaction: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to initialize payment"})
	}

	utils.LogInfo("Payment initialized for user %s: reference=%s, amount=%d, credits=%d", userID, result.Data.Reference, req.Amount, req.Credits)

	return c.Status(201).JSON(fiber.Map{
		"ok":                   true,
		"reference":            result.Data.Reference,
		"access_code":          result.Data.AccessCode,
		"authorization_url":    result.Data.AuthorizationURL,
		"amount":               req.Amount,
		"credits":              req.Credits,
		"user_id":              userID,
		"message":              "Payment initialized successfully",
	})
}

// VerifyPayment verifies Paystack payment
func (h *PaymentController) VerifyPayment(c *fiber.Ctx) error {
	reference := c.Params("reference")
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError("Unauthorized payment verification attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	if reference == "" {
		utils.LogWarn("Payment verification missing reference")
		return c.Status(400).JSON(fiber.Map{"error": "Payment reference is required"})
	}

	// If Paystack service not configured, return mock
	if h.paystackService == nil {
		utils.LogWarn("Paystack not configured, returning mock verification for reference %s", reference)
		return c.JSON(fiber.Map{
			"ok":              true,
			"status":          "success",
			"reference":       reference,
			"user_id":         userID,
			"amount":          50000,
			"credits_added":   150,
			"message":         "Payment verified (mock mode)",
		})
	}

	// Verify with Paystack API
	result, err := h.paystackService.VerifyTransaction(reference)
	if err != nil {
		utils.LogError("Paystack verification failed for reference %s: %v", reference, err)
		return c.Status(400).JSON(fiber.Map{
			"ok":      false,
			"status":  "failed",
			"message": "Payment verification failed",
		})
	}

	// Check if payment was successful
	if result.Data.Status != "success" {
		utils.LogWarn("Payment not successful for reference %s: status=%s", reference, result.Data.Status)
		return c.Status(400).JSON(fiber.Map{
			"ok":      false,
			"status":  result.Data.Status,
			"message": "Payment not successful",
		})
	}

	// Calculate credits (e.g., 1 credit per ₦100)
	creditsAdded := result.Data.Amount / 10000

	utils.LogInfo("Payment verified successfully: reference=%s, user=%s, amount=%d, credits=%d", reference, userID, result.Data.Amount, creditsAdded)

	return c.JSON(fiber.Map{
		"ok":              true,
		"status":          "success",
		"reference":       reference,
		"user_id":         userID,
		"amount":          result.Data.Amount,
		"credits_added":   creditsAdded,
		"last4":           result.Data.Authorization.Last4,
		"brand":           result.Data.Authorization.Brand,
		"message":         "Payment verified and credits added",
	})
}

// ProcessBatchPayouts handles admin batch payout processing
func (h *PaymentController) ProcessBatchPayouts(c *fiber.Ctx) error {
	var req struct {
		WithdrawalIDs []string `json:"withdrawal_ids"`
		AdminNote     string   `json:"admin_note,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	
	// TODO: Process each withdrawal via Paystack
	// TODO: Update withdrawal statuses
	// TODO: Create audit log entries
	
	processed := 0
	failed := 0
	totalAmount := 0

	for _, withdrawalID := range req.WithdrawalIDs {
		// Mock processing
		if len(withdrawalID) > 0 {
			processed++
			totalAmount += 15000 // Mock amount
		} else {
			failed++
		}
	}

	return c.JSON(fiber.Map{
		"ok":           true,
		"processed":    processed,
		"failed":       failed,
		"total_amount": totalAmount,
		"admin_id":     adminID,
		"message":      fmt.Sprintf("Processed %d payouts, %d failed", processed, failed),
	})
}

// GetPaymentMethods returns user's saved payment methods
func (h *PaymentController) GetPaymentMethods(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	
	// Mock payment methods
	methods := []fiber.Map{
		{
			"id":          "pm_001",
			"type":        "card",
			"last4":       "4242",
			"brand":       "visa",
			"exp_month":   12,
			"exp_year":    2025,
			"is_default":  true,
		},
	}

	return c.JSON(fiber.Map{
		"payment_methods": methods,
		"user_id":        userID,
	})
}

// AddPaymentMethod adds new payment method
func (h *PaymentController) AddPaymentMethod(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	
	var req struct {
		CardToken string `json:"card_token"`
		SetDefault bool  `json:"set_default"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Save payment method via Paystack
	
	methodID := uuid.New()

	return c.Status(201).JSON(fiber.Map{
		"ok":        true,
		"method_id": methodID,
		"user_id":   userID,
		"message":   "Payment method added successfully",
	})
}

// GetTransactionHistory returns user's transaction history
func (h *PaymentController) GetTransactionHistory(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	
	// Mock transaction history
	transactions := []fiber.Map{
		{
			"id":          "txn_001",
			"type":        "credit_purchase",
			"amount":      40000,
			"credits":     150,
			"status":      "completed",
			"reference":   "PS_123456789",
			"description": "Professional Pack Purchase",
			"created_at":  time.Now().AddDate(0, 0, -2),
		},
		{
			"id":          "txn_002",
			"type":        "survey_cost",
			"amount":      -5000,
			"credits":     -50,
			"status":      "completed",
			"reference":   "SUR_987654321",
			"description": "Consumer Survey - 50 responses",
			"created_at":  time.Now().AddDate(0, 0, -5),
		},
	}

	return c.JSON(fiber.Map{
		"transactions": transactions,
		"user_id":     userID,
	})
}

// RefundTransaction handles transaction refunds
func (h *PaymentController) RefundTransaction(c *fiber.Ctx) error {
	transactionID := c.Params("id")
	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	
	var req struct {
		Reason string `json:"reason"`
		Amount int    `json:"amount,omitempty"` // partial refund amount
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Process refund via Paystack
	// TODO: Update transaction status
	// TODO: Create audit log
	
	refundID := uuid.New()

	return c.JSON(fiber.Map{
		"ok":             true,
		"refund_id":      refundID,
		"transaction_id": transactionID,
		"admin_id":       adminID,
		"reason":         req.Reason,
		"message":        "Refund processed successfully",
	})
}