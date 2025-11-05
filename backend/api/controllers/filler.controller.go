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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
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
		"SELECT COUNT(*) FROM responses WHERE user_id = $1",
		userID).Scan(&completedCount)

	// Get total earnings
	var totalEarnings int
	err = h.db.QueryRow(context.Background(),
		"SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1",
		userID).Scan(&totalEarnings)

	// Get recent surveys (limit 5)
	rows, err := h.db.Query(context.Background(),
		"SELECT id, title, description, reward, estimated_time FROM surveys WHERE status = $1 ORDER BY created_at DESC LIMIT 5",
		"active")

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	var recentSurveys []fiber.Map
	for rows.Next() {
		var surveyID, title, description string
		var reward, estimatedTime int

		if err := rows.Scan(&surveyID, &title, &description, &reward, &estimatedTime); err != nil {
			continue
		}

		recentSurveys = append(recentSurveys, fiber.Map{
			"id":             surveyID,
			"title":          title,
			"description":    description,
			"reward":         reward,
			"estimated_time": estimatedTime,
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
				"active_surveys":   activeSurveyCount,
				"completed_surveys": completedCount,
				"total_earnings":   totalEarnings,
			},
			"recent_surveys": recentSurveys,
		},
		"timestamp": time.Now(),
	})
}

func (h *FillerController) GetAvailableSurveys(c *fiber.Ctx) error {
	// Get all active surveys
	rows, err := h.db.Query(context.Background(),
		"SELECT id, title, description, category, reward, estimated_time, status FROM surveys WHERE status = $1 ORDER BY created_at DESC",
		"active")

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys", "success": false})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description, category, status string
		var reward, estimatedTime int

		if err := rows.Scan(&id, &title, &description, &category, &reward, &estimatedTime, &status); err != nil {
			continue
		}

		surveys = append(surveys, fiber.Map{
			"id":             id,
			"title":          title,
			"description":    description,
			"category":       category,
			"reward":         reward,
			"estimated_time": estimatedTime,
			"status":         status,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
		"count":   len(surveys),
	})
}

func (h *FillerController) GetCompletedSurveys(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
	}

	rows, err := h.db.Query(context.Background(),
		"SELECT s.id, s.title, s.reward, r.created_at FROM surveys s JOIN responses r ON s.id = r.survey_id WHERE r.user_id = $1 ORDER BY r.created_at DESC",
		userID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch completed surveys", "success": false})
	}
	defer rows.Close()

	var completedSurveys []fiber.Map
	for rows.Next() {
		var id, title string
		var reward int
		var completedAt time.Time

		if err := rows.Scan(&id, &title, &reward, &completedAt); err != nil {
			continue
		}

		completedSurveys = append(completedSurveys, fiber.Map{
			"survey_id":    id,
			"title":        title,
			"reward":       reward,
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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized", "success": false})
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
		"success":          true,
		"data":             earnings,
		"count":            len(earnings),
		"total_earnings":   totalEarnings,
	})
}
