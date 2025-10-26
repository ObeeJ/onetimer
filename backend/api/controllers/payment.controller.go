package controllers

import (
	"fmt"
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PaymentController struct {
	cache *cache.Cache
}

func NewPaymentController(cache *cache.Cache) *PaymentController {
	return &PaymentController{cache: cache}
}

// PurchaseCredits handles credit purchases via Paystack
func (h *PaymentController) PurchaseCredits(c *fiber.Ctx) error {
	var req struct {
		PackageID    string `json:"package_id,omitempty"`
		CustomAmount int    `json:"custom_amount,omitempty"`
		Credits      int    `json:"credits"`
		Amount       int    `json:"amount"` // in kobo
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate purchase
	if req.Credits < 10 {
		return c.Status(400).JSON(fiber.Map{"error": "Minimum purchase is 10 credits"})
	}

	// TODO: Initialize Paystack transaction
	// TODO: Create payment record in database
	
	transactionID := uuid.New()
	paystackRef := fmt.Sprintf("PS_%s", transactionID.String()[:12])

	return c.Status(201).JSON(fiber.Map{
		"ok":               true,
		"transaction_id":   transactionID,
		"paystack_ref":     paystackRef,
		"amount":           req.Amount,
		"credits":          req.Credits,
		"payment_url":      fmt.Sprintf("https://checkout.paystack.com/%s", paystackRef),
		"message":          "Payment initialized successfully",
	})
}

// VerifyPayment verifies Paystack payment
func (h *PaymentController) VerifyPayment(c *fiber.Ctx) error {
	reference := c.Params("reference")
	userID := c.Locals("user_id").(string)
	
	// TODO: Verify payment with Paystack API
	// TODO: Update user credits if payment successful
	// TODO: Create transaction record
	
	// Mock verification
	verified := true
	if verified {
		return c.JSON(fiber.Map{
			"ok":      true,
			"status":  "success",
			"reference": reference,
			"user_id": userID,
			"credits_added": 150,
			"message": "Payment verified and credits added",
		})
	}

	return c.Status(400).JSON(fiber.Map{
		"ok":      false,
		"status":  "failed",
		"message": "Payment verification failed",
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

	adminID := c.Locals("user_id").(string)
	
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
	userID := c.Locals("user_id").(string)
	
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
	userID := c.Locals("user_id").(string)
	
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
	userID := c.Locals("user_id").(string)
	
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
	adminID := c.Locals("user_id").(string)
	
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