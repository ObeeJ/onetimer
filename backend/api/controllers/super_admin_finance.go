package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SuperAdminFinanceController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewSuperAdminFinanceController(cache *cache.Cache, db *pgxpool.Pool) *SuperAdminFinanceController {
	return &SuperAdminFinanceController{cache: cache, db: db}
}

// GET /api/super-admin/financials/metrics
func (h *SuperAdminFinanceController) GetFinancialMetrics(c *fiber.Ctx) error {
	ctx := context.Background()

	// Total revenue this month
	var totalRevenue float64
	h.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM earnings 
		WHERE status = 'completed' 
		AND created_at >= DATE_TRUNC('month', NOW())
	`).Scan(&totalRevenue)

	// Pending payouts
	var pendingPayouts float64
	h.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM earnings 
		WHERE status = 'pending'
	`).Scan(&pendingPayouts)

	// Processing fees (assuming 2.5% transaction fee)
	processingFees := totalRevenue * 0.025

	// Net profit (revenue - payouts - fees)
	netProfit := totalRevenue - pendingPayouts - processingFees

	// Previous month for comparison
	var prevRevenue float64
	h.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM earnings 
		WHERE status = 'completed' 
		AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
		AND created_at < DATE_TRUNC('month', NOW())
	`).Scan(&prevRevenue)

	revenueChange := calculatePercentageChange(int(prevRevenue), int(totalRevenue))

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"totalRevenue":    totalRevenue,
			"revenueChange":   revenueChange,
			"pendingPayouts":  pendingPayouts,
			"payoutChange":    "-8%",
			"processingFees":  processingFees,
			"feeChange":       "+15%",
			"netProfit":       netProfit,
			"profitChange":    "+28%",
		},
	})
}

// GET /api/super-admin/financials/payouts
func (h *SuperAdminFinanceController) GetPayoutQueue(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT 
			e.id,
			SUM(e.amount) as total_amount,
			COUNT(DISTINCT e.user_id) as user_count,
			e.status,
			u.name as submitted_by,
			e.created_at
		FROM earnings e
		LEFT JOIN users u ON e.user_id = u.id
		WHERE e.status IN ('pending', 'processing')
		GROUP BY e.id, e.status, u.name, e.created_at
		ORDER BY e.created_at DESC
		LIMIT 20
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get payout queue", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch payouts"})
	}
	defer rows.Close()

	payouts := []fiber.Map{}
	for rows.Next() {
		var id, status, submittedBy string
		var amount float64
		var userCount int
		var createdAt time.Time

		rows.Scan(&id, &amount, &userCount, &status, &submittedBy, &createdAt)

		priority := "low"
		if amount > 100000 {
			priority = "high"
		} else if amount > 50000 {
			priority = "medium"
		}

		payouts = append(payouts, fiber.Map{
			"id":          id,
			"amount":      amount,
			"users":       userCount,
			"status":      status,
			"priority":    priority,
			"submittedBy": submittedBy,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    payouts,
	})
}

// GET /api/super-admin/financials/reconciliation
func (h *SuperAdminFinanceController) GetReconciliation(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT 
			DATE(created_at) as date,
			SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as expected,
			SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as processed
		FROM earnings
		WHERE created_at >= NOW() - INTERVAL '7 days'
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at) DESC
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get reconciliation", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch reconciliation"})
	}
	defer rows.Close()

	reconciliation := []fiber.Map{}
	for rows.Next() {
		var date time.Time
		var expected, processed float64

		rows.Scan(&date, &expected, &processed)

		variance := processed - expected
		status := "matched"
		if variance != 0 {
			status = "review"
		}

		varianceStr := "₦0"
		if variance > 0 {
			varianceStr = "+₦" + formatMoney(variance)
		} else if variance < 0 {
			varianceStr = "-₦" + formatMoney(-variance)
		}

		reconciliation = append(reconciliation, fiber.Map{
			"date":      date.Format("2006-01-02"),
			"expected":  "₦" + formatMoney(expected),
			"processed": "₦" + formatMoney(processed),
			"variance":  varianceStr,
			"status":    status,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reconciliation,
	})
}

// POST /api/super-admin/financials/approve-payout/:id
func (h *SuperAdminFinanceController) ApprovePayout(c *fiber.Ctx) error {
	ctx := context.Background()
	payoutID := c.Params("id")

	_, err := h.db.Exec(ctx, `
		UPDATE earnings 
		SET status = 'processing', updated_at = NOW()
		WHERE id = $1
	`, payoutID)

	if err != nil {
		utils.LogError(ctx, "Failed to approve payout", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to approve payout"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Payout approved successfully",
	})
}

func formatMoney(amount float64) string {
	return fiber.Map{"amount": amount}["amount"].(string)
}
