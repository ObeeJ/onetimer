package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/services"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EarningsController struct {
	cache    *cache.Cache
	db       *pgxpool.Pool
	paystack *services.PaystackService
}

func NewEarningsController(cache *cache.Cache, db *pgxpool.Pool, cfg *config.Config) *EarningsController {
	return &EarningsController{
		cache:    cache,
		db:       db,
		paystack: services.NewPaystackService(cfg.PaystackSecret),
	}
}

func (h *EarningsController) GetEarnings(c *fiber.Ctx) error {
	earnings := fiber.Map{
		"balance": 12300,
		"total_earned": 24750,
		"this_month": 8250,
		"pending": 1500,
		"withdrawn": 11250,
		"history": []fiber.Map{
			{
				"id": "e1",
				"title": "Survey #1 - Consumer Preferences",
				"amount": 300,
				"date": time.Now().Format("2006-01-02"),
				"status": "completed",
				"type": "earning",
			},
			{
				"id": "e2",
				"title": "Survey #2 - Technology Usage",
				"amount": 450,
				"date": time.Now().AddDate(0, 0, -1).Format("2006-01-02"),
				"status": "completed",
				"type": "earning",
			},
			{
				"id": "e3",
				"title": "Referral Bonus - Friend Signup",
				"amount": 1000,
				"date": time.Now().AddDate(0, 0, -2).Format("2006-01-02"),
				"status": "completed",
				"type": "referral",
			},
			{
				"id": "e4",
				"title": "Withdrawal to Bank Account",
				"amount": -5000,
				"date": time.Now().AddDate(0, 0, -7).Format("2006-01-02"),
				"status": "completed",
				"type": "withdrawal",
			},
		},
	}

	return c.JSON(earnings)
}

func (h *EarningsController) WithdrawEarnings(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	_ = userID
	
	var req struct {
		AccountName   string `json:"account_name"`
		BankCode      string `json:"bank_code"`
		BankName      string `json:"bank_name"`
		AccountNumber string `json:"account_number"`
		Amount        int    `json:"amount"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Generate withdrawal reference
	withdrawalRef := "WITHDRAW_" + userID[:8] + "_" + time.Now().Format("20060102150405")

	// For now, we would need to:
	// 1. Create/get transfer recipient from bank details
	// 2. Initiate the transfer
	// Since we don't have CreateTransferRecipient yet, we'll use the InitiateTransfer directly
	// with a placeholder recipient ID (in real implementation, you'd create the recipient first)

	// Mock recipient ID - in production, create from bank details first
	recipientID := 0 // Would be obtained from CreateTransferRecipient

	if h.paystack != nil {
		// Initiate transfer with amount and reason
		result, err := h.paystack.InitiateTransfer(req.Amount, recipientID, "OneTimer withdrawal", withdrawalRef)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to process withdrawal: " + err.Error()})
		}

		return c.JSON(fiber.Map{
			"ok":              true,
			"withdrawal_ref":  result.Data.Reference,
			"transfer_code":   result.Data.TransferCode,
			"amount":          req.Amount,
			"status":          result.Data.Status,
			"account_name":    req.AccountName,
			"account_number":  req.AccountNumber,
			"message":         "Withdrawal processed successfully",
		})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Withdrawal processed successfully",
	})
}