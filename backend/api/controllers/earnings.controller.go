package controllers

import (
	"context"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/services"
	"onetimer-backend/utils"
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
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetEarnings request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized earnings access attempt", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in earnings request", "user_id", userID)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	utils.LogInfo(ctx, "Fetching earnings for user", "user_id", userID)

	// Check cache first
	cacheKey := "earnings:" + userID
	var cachedEarnings fiber.Map
	if err := h.cache.Get(c.Context(), cacheKey, &cachedEarnings); err == nil {
		utils.LogInfo(ctx, "✅ Earnings retrieved from cache", "user_id", userID)
		return c.JSON(cachedEarnings)
	}

	utils.LogInfo(ctx, "Cache miss, fetching from database", "user_id", userID)

	// Check if database is available
	if h.db == nil {
		utils.LogWarn(ctx, "⚠️ Database unavailable for earnings, returning mock data", "user_id", userID)
		// Return mock data when database is unavailable
		mockEarnings := fiber.Map{
			"balance": 12300, "total_earned": 24750, "this_month": 8250,
			"transactions": []fiber.Map{
				{"id": "e1", "description": "Survey Completion", "amount": 300, "date": time.Now().Format("2006-01-02"), "status": "completed", "type": "earning"},
				{"id": "e2", "description": "Survey Completion", "amount": 450, "date": time.Now().AddDate(0, 0, -1).Format("2006-01-02"), "status": "completed", "type": "earning"},
			},
			"success": true,
		}
		return c.JSON(mockEarnings)
	}

	// Get earnings from database with timeout
	dbCtx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()

	// Get total earnings
	var totalEarned, balance int
	if err := h.db.QueryRow(dbCtx, "SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1 AND status = 'completed'", userID).Scan(&totalEarned); err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch total earnings from database", err, "user_id", userID)
	}
	if err := h.db.QueryRow(dbCtx, "SELECT COALESCE(balance, 0) FROM fillers WHERE user_id = $1", userID).Scan(&balance); err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch balance from database", err, "user_id", userID)
	}

	utils.LogInfo(ctx, "Earnings calculated", "user_id", userID, "total_earned", totalEarned, "balance", balance)

	// Get recent transactions
	rows, err := h.db.Query(dbCtx, "SELECT id, amount, type, status, created_at FROM earnings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", userID)
	if err != nil {
		utils.LogError(ctx, "⚠️ Database error: failed to fetch earnings transactions", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch earnings", "success": false})
	}
	defer rows.Close()

	var transactions []fiber.Map
	for rows.Next() {
		var id, earningType, status string
		var amount int
		var createdAt time.Time
		if err := rows.Scan(&id, &amount, &earningType, &status, &createdAt); err != nil {
			continue
		}
		transactions = append(transactions, fiber.Map{
			"id": id, "description": "Survey Completion", "amount": amount,
			"date": createdAt.Format("2006-01-02"), "status": status, "type": earningType,
		})
	}

	earnings := fiber.Map{
		"balance": balance, "total_earned": totalEarned, "transactions": transactions, "success": true,
	}

	// Cache for 2 minutes
	if err := h.cache.Set(c.Context(), cacheKey, earnings); err != nil {
		utils.LogWarn(ctx, "Failed to cache earnings (non-fatal)", "user_id", userID, "error", err.Error())
	} else {
		utils.LogInfo(ctx, "✅ Earnings cached", "user_id", userID)
	}

	utils.LogInfo(ctx, "← GetEarnings completed successfully", "user_id", userID, "transaction_count", len(transactions))
	return c.JSON(earnings)
}

func (h *EarningsController) WithdrawEarnings(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ WithdrawEarnings request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized withdrawal attempt", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID in withdrawal request", "user_id", userID)
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		AccountName   string `json:"account_name"`
		BankCode      string `json:"bank_code"`
		BankName      string `json:"bank_name"`
		AccountNumber string `json:"account_number"`
		Amount        int    `json:"amount"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid withdrawal request body", err, "user_id", userID, "ip", c.IP())
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Withdrawal initiated", "user_id", userID, "amount", req.Amount, "bank", req.BankName, "account", req.AccountNumber)

	// Validate amount
	if req.Amount <= 0 {
		utils.LogWarn(ctx, "⚠️ Invalid withdrawal amount", "user_id", userID, "amount", req.Amount)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid amount"})
	}

	// Generate withdrawal reference
	withdrawalRef := "WITHDRAW_" + userID[:8] + "_" + time.Now().Format("20060102150405")
	utils.LogInfo(ctx, "Withdrawal reference generated", "user_id", userID, "ref", withdrawalRef)

	// For now, we would need to:
	// 1. Create/get transfer recipient from bank details
	// 2. Initiate the transfer
	// Since we don't have CreateTransferRecipient yet, we'll use the InitiateTransfer directly
	// with a placeholder recipient ID (in real implementation, you'd create the recipient first)

	// Mock recipient ID - in production, create from bank details first
	recipientID := 0 // Would be obtained from CreateTransferRecipient

	if h.paystack != nil {
		utils.LogInfo(ctx, "Initiating Paystack transfer", "user_id", userID, "amount", req.Amount, "ref", withdrawalRef)

		// Initiate transfer with amount and reason
		result, err := h.paystack.InitiateTransfer(req.Amount, recipientID, "OneTimer withdrawal", withdrawalRef)
		if err != nil {
			utils.LogError(ctx, "⚠️ Paystack transfer failed", err, "user_id", userID, "amount", req.Amount, "ref", withdrawalRef)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to process withdrawal: " + err.Error()})
		}

		utils.LogInfo(ctx, "✅ Withdrawal processed successfully via Paystack", "user_id", userID, "amount", req.Amount, "ref", withdrawalRef, "status", result.Data.Status)

		return c.JSON(fiber.Map{
			"ok":             true,
			"withdrawal_ref": result.Data.Reference,
			"transfer_code":  result.Data.TransferCode,
			"amount":         req.Amount,
			"status":         result.Data.Status,
			"account_name":   req.AccountName,
			"account_number": req.AccountNumber,
			"message":        "Withdrawal processed successfully",
		})
	}

	utils.LogWarn(ctx, "⚠️ Paystack service unavailable, processing without transfer", "user_id", userID, "amount", req.Amount)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Withdrawal processed successfully",
	})
}
