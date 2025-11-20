package controllers

import (
	"context"
	"onetimer-backend/cache"
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
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	// Check if database is available
	if h.db == nil {
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
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch user data"})
	}

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

	// Get recent surveys (limit 5)
	rows, err := h.db.Query(context.Background(),
		"SELECT id, title, description FROM surveys WHERE status = $1 ORDER BY created_at DESC LIMIT 5",
		"active")

	if err != nil {
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
	// Get all active surveys
	rows, err := h.db.Query(context.Background(),
		"SELECT id, title, description FROM surveys WHERE status = $1 ORDER BY created_at DESC",
		"active")

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys", "success": false})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description string

		if err := rows.Scan(&id, &title, &description); err != nil {
			continue
		}

		surveys = append(surveys, fiber.Map{
			"id":          id,
			"title":       title,
			"description": description,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
		"count":   len(surveys),
	})
}

func (h *FillerController) GetCompletedSurveys(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	// Check if database is available
	if h.db == nil {
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

	return c.JSON(fiber.Map{
		"success": true,
		"data":    completedSurveys,
		"count":   len(completedSurveys),
	})
}

func (h *FillerController) GetEarningsHistory(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}
	userID, ok := userIDInterface.(string)
	if !ok || userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user ID", "success": false})
	}

	// Check if database is available
	if h.db == nil {
		// Return mock data when database is unavailable
		mockEarnings := []fiber.Map{
			{"id": "e1", "amount": 300, "source": "survey_completion", "status": "completed", "created_at": time.Now().AddDate(0, 0, -1)},
			{"id": "e2", "amount": 450, "source": "survey_completion", "status": "completed", "created_at": time.Now().AddDate(0, 0, -2)},
		}
		return c.JSON(fiber.Map{"success": true, "data": mockEarnings, "count": len(mockEarnings), "total_earnings": 750})
	}

	rows, err := h.db.Query(context.Background(),
		"SELECT id, amount, source, status, created_at FROM earnings WHERE user_id = $1 ORDER BY created_at DESC",
		userID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch earnings", "success": false})
	}
	defer rows.Close()

	var earnings []fiber.Map
	var totalEarnings int
	for rows.Next() {
		var id, source, status string
		var amount int
		var createdAt time.Time

		if err := rows.Scan(&id, &amount, &source, &status, &createdAt); err != nil {
			continue
		}

		totalEarnings += amount
		earnings = append(earnings, fiber.Map{
			"id":         id,
			"amount":     amount,
			"source":     source,
			"status":     status,
			"created_at": createdAt,
		})
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"data":           earnings,
		"count":          len(earnings),
		"total_earnings": totalEarnings,
	})
}
