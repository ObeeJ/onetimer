package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SuperAdminAnalyticsController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewSuperAdminAnalyticsController(cache *cache.Cache, db *pgxpool.Pool) *SuperAdminAnalyticsController {
	return &SuperAdminAnalyticsController{cache: cache, db: db}
}

// GET /api/super-admin/analytics/monthly
func (h *SuperAdminAnalyticsController) GetMonthlyAnalytics(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT 
			TO_CHAR(created_at, 'Mon') as month,
			COUNT(*) as count
		FROM users
		WHERE created_at >= NOW() - INTERVAL '6 months'
		GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
		ORDER BY DATE_TRUNC('month', created_at)
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get monthly analytics", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch analytics"})
	}
	defer rows.Close()

	monthlyData := []fiber.Map{}
	for rows.Next() {
		var month string
		var users int
		rows.Scan(&month, &users)

		// Get surveys for this month
		var surveys int
		h.db.QueryRow(ctx, `
			SELECT COUNT(*) FROM surveys 
			WHERE TO_CHAR(created_at, 'Mon') = $1
			AND created_at >= NOW() - INTERVAL '6 months'
		`, month).Scan(&surveys)

		// Get revenue for this month
		var revenue float64
		h.db.QueryRow(ctx, `
			SELECT COALESCE(SUM(amount), 0) FROM earnings 
			WHERE TO_CHAR(created_at, 'Mon') = $1
			AND created_at >= NOW() - INTERVAL '6 months'
			AND status = 'completed'
		`, month).Scan(&revenue)

		monthlyData = append(monthlyData, fiber.Map{
			"month":   month,
			"users":   users,
			"surveys": surveys,
			"revenue": revenue,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    monthlyData,
	})
}

// GET /api/super-admin/analytics/user-distribution
func (h *SuperAdminAnalyticsController) GetUserDistribution(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT role, COUNT(*) as count
		FROM users
		WHERE is_active = true
		GROUP BY role
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get user distribution", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch distribution"})
	}
	defer rows.Close()

	distribution := []fiber.Map{}
	colorMap := map[string]string{
		"filler":      "#3b82f6",
		"creator":     "#f59e0b",
		"admin":       "#10b981",
		"super_admin": "#8b5cf6",
	}

	for rows.Next() {
		var role string
		var count int
		rows.Scan(&role, &count)

		var name string
		switch role {
		case "filler":
			name = "Fillers"
		case "creator":
			name = "Creators"
		case "admin":
			name = "Admins"
		default:
			name = role
		}

		distribution = append(distribution, fiber.Map{
			"name":  name,
			"value": count,
			"color": colorMap[role],
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    distribution,
	})
}

// GET /api/super-admin/analytics/revenue-trends
func (h *SuperAdminAnalyticsController) GetRevenueTrends(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT 
			TO_CHAR(created_at, 'Mon') as month,
			SUM(amount) as revenue
		FROM earnings
		WHERE created_at >= NOW() - INTERVAL '6 months'
		AND status = 'completed'
		GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
		ORDER BY DATE_TRUNC('month', created_at)
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get revenue trends", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch trends"})
	}
	defer rows.Close()

	trends := []fiber.Map{}
	for rows.Next() {
		var month string
		var revenue float64
		rows.Scan(&month, &revenue)

		profit := revenue * 0.20 // Assuming 20% profit margin

		trends = append(trends, fiber.Map{
			"month":   month,
			"revenue": revenue,
			"profit":  profit,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    trends,
	})
}

// GET /api/super-admin/surveys/stats
func (h *SuperAdminAnalyticsController) GetSurveyStats(c *fiber.Ctx) error {
	ctx := context.Background()

	var total, active, pending, suspended int

	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM surveys").Scan(&total)
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM surveys WHERE status = 'active'").Scan(&active)
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM surveys WHERE status = 'pending'").Scan(&pending)
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM surveys WHERE status = 'suspended'").Scan(&suspended)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":     total,
			"active":    active,
			"pending":   pending,
			"suspended": suspended,
		},
	})
}

// GET /api/super-admin/surveys/list
func (h *SuperAdminAnalyticsController) GetSurveysList(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Query(ctx, `
		SELECT 
			s.id,
			s.title,
			u.name as creator_name,
			s.status,
			s.reward_amount,
			s.created_at,
			COUNT(sr.id) as response_count
		FROM surveys s
		LEFT JOIN users u ON s.creator_id = u.id
		LEFT JOIN survey_responses sr ON s.id = sr.survey_id
		GROUP BY s.id, s.title, u.name, s.status, s.reward_amount, s.created_at
		ORDER BY s.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		utils.LogError(ctx, "Failed to get surveys list", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	surveys := []fiber.Map{}
	for rows.Next() {
		var id, title, creator, status string
		var reward float64
		var createdAt time.Time
		var responses int

		rows.Scan(&id, &title, &creator, &status, &reward, &createdAt, &responses)

		surveys = append(surveys, fiber.Map{
			"id":        id,
			"title":     title,
			"creator":   creator,
			"status":    status,
			"responses": responses,
			"reward":    reward,
			"created":   createdAt.Format("2006-01-02"),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
	})
}
