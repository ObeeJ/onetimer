package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WithdrawalController struct {
	cache       *cache.Cache
	db          *pgxpool.Pool
	paystackKey string
}

func NewWithdrawalController(cache *cache.Cache, db *pgxpool.Pool, paystackKey string) *WithdrawalController {
	return &WithdrawalController{cache: cache, db: db, paystackKey: paystackKey}
}

// RequestWithdrawal handles withdrawal requests from fillers
func (h *WithdrawalController) RequestWithdrawal(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		Amount        int    `json:"amount"`
		BankName      string `json:"bank_name"`
		AccountNumber string `json:"account_number"`
		AccountName   string `json:"account_name"`
		BankCode      string `json:"bank_code"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate minimum withdrawal amount
	if req.Amount < 5000 {
		return c.Status(400).JSON(fiber.Map{"error": "Minimum withdrawal amount is ₦5,000"})
	}

	// Check user balance
	var balance int
	balanceQuery := `SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1 AND status = 'completed'`
	err := h.db.QueryRow(context.Background(), balanceQuery, userID).Scan(&balance)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to check balance"})
	}

	// Check for pending withdrawals
	var pendingAmount int
	pendingQuery := `SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE user_id = $1 AND status IN ('pending', 'processing')`
	h.db.QueryRow(context.Background(), pendingQuery, userID).Scan(&pendingAmount)

	availableBalance := balance - pendingAmount
	if availableBalance < req.Amount {
		return c.Status(400).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	// Verify bank account with Paystack
	accountValid, accountName, err := h.verifyBankAccount(req.AccountNumber, req.BankCode)
	if err != nil || !accountValid {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid bank account details"})
	}

	// Create withdrawal record
	withdrawalID := uuid.New()
	insertQuery := `
		INSERT INTO withdrawals (id, user_id, amount, bank_name, account_number, account_name, bank_code, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
	`
	_, err = h.db.Exec(context.Background(), insertQuery, withdrawalID, userID, req.Amount,
		req.BankName, req.AccountNumber, accountName, req.BankCode)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create withdrawal request"})
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":              true,
		"withdrawal_id":   withdrawalID,
		"amount":          req.Amount,
		"status":          "pending",
		"message":         "Withdrawal request submitted successfully",
		"processing_time": "1-3 business days",
	})
}

// GetWithdrawals returns user's withdrawal history
func (h *WithdrawalController) GetWithdrawals(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Mock data - TODO: Replace with database query
	withdrawals := []fiber.Map{
		{
			"id":             "w_001",
			"amount":         15000,
			"status":         "completed",
			"bank_name":      "Access Bank",
			"account_number": "****1234",
			"created_at":     time.Now().AddDate(0, 0, -5),
			"processed_at":   time.Now().AddDate(0, 0, -3),
		},
		{
			"id":             "w_002",
			"amount":         8500,
			"status":         "pending",
			"bank_name":      "GTBank",
			"account_number": "****5678",
			"created_at":     time.Now().AddDate(0, 0, -1),
			"processed_at":   nil,
		},
	}

	return c.JSON(fiber.Map{
		"withdrawals": withdrawals,
		"user_id":     userID,
	})
}

// GetBanks returns list of supported Nigerian banks
func (h *WithdrawalController) GetBanks(c *fiber.Ctx) error {
	banks := []fiber.Map{
		{"name": "Access Bank", "code": "044"},
		{"name": "GTBank", "code": "058"},
		{"name": "First Bank", "code": "011"},
		{"name": "Zenith Bank", "code": "057"},
		{"name": "UBA", "code": "033"},
		{"name": "Fidelity Bank", "code": "070"},
		{"name": "Union Bank", "code": "032"},
		{"name": "Sterling Bank", "code": "232"},
		{"name": "Stanbic IBTC", "code": "221"},
		{"name": "Polaris Bank", "code": "076"},
	}

	return c.JSON(fiber.Map{"banks": banks})
}

// VerifyAccount verifies bank account details via Paystack
func (h *WithdrawalController) VerifyAccount(c *fiber.Ctx) error {
	var req struct {
		AccountNumber string `json:"account_number"`
		BankCode      string `json:"bank_code"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Verify account with Paystack
	accountValid, accountName, err := h.verifyBankAccount(req.AccountNumber, req.BankCode)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Verification failed"})
	}

	return c.JSON(fiber.Map{
		"account_name":   accountName,
		"account_number": req.AccountNumber,
		"bank_code":      req.BankCode,
		"verified":       accountValid,
	})
}

// verifyBankAccount verifies bank account with Paystack
func (h *WithdrawalController) verifyBankAccount(accountNumber, bankCode string) (bool, string, error) {
	url := fmt.Sprintf("https://api.paystack.co/bank/resolve?account_number=%s&bank_code=%s", accountNumber, bankCode)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, "", err
	}

	req.Header.Set("Authorization", "Bearer "+h.paystackKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false, "", err
	}
	defer resp.Body.Close()

	var result struct {
		Status bool `json:"status"`
		Data   struct {
			AccountName   string `json:"account_name"`
			AccountNumber string `json:"account_number"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, "", err
	}

	return result.Status, result.Data.AccountName, nil
}

// processPaystackTransfer processes withdrawal via Paystack
func (h *WithdrawalController) processPaystackTransfer(withdrawalID uuid.UUID, amount int, accountNumber, bankCode, reason string) error {
	url := "https://api.paystack.co/transfer"

	payload := map[string]interface{}{
		"source":    "balance",
		"amount":    amount * 100, // Convert to kobo
		"recipient": fmt.Sprintf("%s-%s", bankCode, accountNumber),
		"reason":    reason,
		"reference": withdrawalID.String(),
	}

	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+h.paystackKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result struct {
		Status bool `json:"status"`
		Data   struct {
			Reference    string `json:"reference"`
			TransferCode string `json:"transfer_code"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	if result.Status {
		// Update withdrawal with Paystack reference
		updateQuery := `UPDATE withdrawals SET paystack_reference = $1, status = 'processing' WHERE id = $2`
		h.db.Exec(context.Background(), updateQuery, result.Data.TransferCode, withdrawalID)
	}

	return nil
}
