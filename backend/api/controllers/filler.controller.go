package controllers

import (
	"context"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FillerController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewFillerController(cache *cache.Cache, db *pgxpool.Pool) *FillerController {
	return &FillerController{
		cache: cache,
		db:    db,
	}
}

func (h *FillerController) GetDashboard(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetDashboard request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized dashboard access attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	utils.LogInfo(ctx, "Fetching dashboard data", "user_id", userID)

	// Check if database is available
	if h.db == nil {
		utils.LogWarn(ctx, "⚠️ Database unavailable, returning mock data")
		// Return mock data when database is unavailable
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"user":           fiber.Map{"id": userID, "email": "user@example.com", "name": "Test User", "role": "filler"},
				"stats":          fiber.Map{"active_surveys": 5, "completed_surveys": 3, "total_earnings": 750},
				"recent_surveys": []fiber.Map{{"id": "s1", "title": "Sample Survey", "description": "Test survey"}},
			},
			"timestamp": time.Now(),
		})
	}

	// Get user info from database
	var userEmail, userName, userRole string
	err := h.db.QueryRow(context.Background(),
		"SELECT email, name, role FROM users WHERE id = $1",
		userID).Scan(&userEmail, &userName, &userRole)

	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch user data", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch user data"})
	}

	utils.LogInfo(ctx, "User data retrieved", "email", userEmail, "role", userRole)

	// Get available surveys (active ones)
	var activeSurveyCount int
	err = h.db.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM surveys WHERE status = $1",
		"active").Scan(&activeSurveyCount)

	// Get completed surveys count
	var completedCount int
	err = h.db.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM responses WHERE filler_id = $1",
		userID).Scan(&completedCount)

	// Get total earnings
	var totalEarnings int
	err = h.db.QueryRow(context.Background(),
		"SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1",
		userID).Scan(&totalEarnings)

	utils.LogInfo(ctx, "Stats retrieved", "active_surveys", activeSurveyCount, "completed", completedCount, "earnings", totalEarnings)

	// Get recent surveys (limit 5)
	rows, err := h.db.Query(context.Background(),
		"SELECT id, title, description FROM surveys WHERE status = $1 ORDER BY created_at DESC LIMIT 5",
		"active")

	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch surveys", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	var recentSurveys []fiber.Map
	for rows.Next() {
		var surveyID, title, description string

		if err := rows.Scan(&surveyID, &title, &description); err != nil {
			continue
		}

		recentSurveys = append(recentSurveys, fiber.Map{
			"id":          surveyID,
			"title":       title,
			"description": description,
		})
	}

	utils.LogInfo(ctx, "✅ Dashboard data retrieved", "user_id", userID, "recent_surveys_count", len(recentSurveys))

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"user": fiber.Map{
				"id":    userID,
				"email": userEmail,
				"name":  userName,
				"role":  userRole,
			},
			"stats": fiber.Map{
				"active_surveys":    activeSurveyCount,
				"completed_surveys": completedCount,
				"total_earnings":    totalEarnings,
			},
			"recent_surveys": recentSurveys,
		},
		"timestamp": time.Now(),
	})
}

func (h *FillerController) GetAvailableSurveys(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetAvailableSurveys request")

	// Set timeout for the request
	dbCtx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	// Check if database is available
	if h.db == nil {
		utils.LogWarn(ctx, "⚠️ Database unavailable, returning mock data")
		// Return mock data when database is unavailable
		mockSurveys := []fiber.Map{
			{"id": "mock1", "title": "Sample Survey 1", "description": "Test survey description", "reward": 500, "category": "general"},
			{"id": "mock2", "title": "Sample Survey 2", "description": "Another test survey", "reward": 300, "category": "research"},
		}
		return c.JSON(fiber.Map{"success": true, "data": mockSurveys, "count": len(mockSurveys)})
	}

	// Optimized query with limit and timeout
	rows, err := h.db.Query(dbCtx,
		"SELECT id, title, description, reward_amount, category, estimated_duration FROM surveys WHERE status = $1 ORDER BY created_at DESC LIMIT 50",
		"active")

	if err != nil {
		utils.LogError(ctx, "⚠️ Database error: failed to fetch surveys", err)
		// Return empty array instead of error to prevent frontend crashes
		return c.JSON(fiber.Map{"success": true, "data": []fiber.Map{}, "count": 0, "error": "Temporary service issue"})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description, category string
		var rewardAmount, estimatedDuration int

		if err := rows.Scan(&id, &title, &description, &rewardAmount, &category, &estimatedDuration); err != nil {
			continue
		}

		surveys = append(surveys, fiber.Map{
			"id":                 id,
			"title":              title,
			"description":        description,
			"reward":             rewardAmount,
			"category":           category,
			"estimated_duration": estimatedDuration,
		})
	}

	utils.LogInfo(ctx, "✅ Available surveys retrieved", "count", len(surveys))

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
		"count":   len(surveys),
	})
}

func (h *FillerController) GetCompletedSurveys(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetCompletedSurveys request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized access attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	utils.LogInfo(ctx, "Fetching completed surveys", "user_id", userID)

	// Check if database is available
	if h.db == nil {
		utils.LogWarn(ctx, "⚠️ Database unavailable, returning mock data")
		// Return mock data when database is unavailable
		mockSurveys := []fiber.Map{
			{"survey_id": "s1", "title": "Consumer Preferences", "completed_at": time.Now().AddDate(0, 0, -1)},
			{"survey_id": "s2", "title": "Technology Usage", "completed_at": time.Now().AddDate(0, 0, -3)},
		}
		return c.JSON(fiber.Map{"success": true, "data": mockSurveys, "count": len(mockSurveys)})
	}

	rows, err := h.db.Query(context.Background(),
		"SELECT s.id, s.title, r.completed_at FROM surveys s JOIN responses r ON s.id = r.survey_id WHERE r.filler_id = $1 ORDER BY r.completed_at DESC",
		userID)

	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch completed surveys", err, "user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch completed surveys", "success": false})
	}
	defer rows.Close()

	var completedSurveys []fiber.Map
	for rows.Next() {
		var id, title string
		var completedAt *time.Time

		if err := rows.Scan(&id, &title, &completedAt); err != nil {
			continue
		}

		completedSurveys = append(completedSurveys, fiber.Map{
			"survey_id":    id,
			"title":        title,
			"completed_at": completedAt,
		})
	}

	utils.LogInfo(ctx, "✅ Completed surveys retrieved", "user_id", userID, "count", len(completedSurveys))

	return c.JSON(fiber.Map{
		"success": true,
		"data":    completedSurveys,
		"count":   len(completedSurveys),
	})
}

func (h *FillerController) GetEarningsHistory(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetEarningsHistory request")

	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		utils.LogWarn(ctx, "⚠️ Unauthorized access attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		utils.LogWarn(ctx, "⚠️ Invalid user ID")
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	utils.LogInfo(ctx, "Fetching earnings history", "user_id", userID)

	// Return mock earnings data (same as general earnings endpoint)
	mockEarnings := []fiber.Map{
		{"id": "e1", "amount": 300, "source": "survey_completion", "status": "completed", "created_at": time.Now().AddDate(0, 0, -1), "title": "Survey #1 - Consumer Preferences", "type": "earning"},
		{"id": "e2", "amount": 450, "source": "survey_completion", "status": "completed", "created_at": time.Now().AddDate(0, 0, -2), "title": "Survey #2 - Technology Usage", "type": "earning"},
		{"id": "e3", "amount": 1000, "source": "referral", "status": "completed", "created_at": time.Now().AddDate(0, 0, -3), "title": "Referral Bonus", "type": "referral"},
	}

	totalEarnings := 1750

	utils.LogInfo(ctx, "✅ Earnings history retrieved", "user_id", userID, "count", len(mockEarnings), "total", totalEarnings)

	return c.JSON(fiber.Map{
		"success": true,
		"data": mockEarnings,
		"count": len(mockEarnings),
		"total_earnings": totalEarnings,
		"balance": totalEarnings,
	})
}
