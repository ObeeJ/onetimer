package controllers

import (
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/services"
	"time"

	"github.com/gofiber/fiber/v2"
)

type EarningsController struct {
	cache    *cache.Cache
	paystack *services.PaystackService
}

func NewEarningsController(cache *cache.Cache, cfg *config.Config) *EarningsController {
	return &EarningsController{
		cache:    cache,
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
	_ = c.Locals("user_id").(string)
	
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

	// Create Paystack transfer recipient
	recipientCode, err := h.paystack.CreateTransferRecipient(
		req.AccountName,
		req.AccountNumber,
		req.BankCode,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create recipient"})
	}

	// Initiate transfer
	err = h.paystack.InitiateTransfer(
		recipientCode,
		req.Amount,
		"OneTimer withdrawal",
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process withdrawal"})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Withdrawal processed successfully",
	})
}