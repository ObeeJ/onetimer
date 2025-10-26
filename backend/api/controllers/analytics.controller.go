package controllers

import (
	"context"
	"fmt"
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewAnalyticsController(cache *cache.Cache, db *pgxpool.Pool) *AnalyticsController {
	return &AnalyticsController{cache: cache, db: db}
}

// GetDashboardAnalytics returns comprehensive dashboard analytics
func (h *AnalyticsController) GetDashboardAnalytics(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	period := c.Query("period", "30d")

	var dateFilter string
	switch period {
	case "7d":
		dateFilter = "created_at >= NOW() - INTERVAL '7 days'"
	case "30d":
		dateFilter = "created_at >= NOW() - INTERVAL '30 days'"
	case "90d":
		dateFilter = "created_at >= NOW() - INTERVAL '90 days'"
	default:
		dateFilter = "created_at >= NOW() - INTERVAL '30 days'"
	}

	// Get survey statistics
	surveyStats := h.getSurveyStats(userID, dateFilter)
	
	// Get response trends
	responseTrends := h.getResponseTrends(userID, period)
	
	// Get demographic breakdown
	demographics := h.getDemographicBreakdown(userID, dateFilter)

	return c.JSON(fiber.Map{
		"survey_stats":   surveyStats,
		"response_trends": responseTrends,
		"demographics":   demographics,
		"period":         period,
	})
}

// GetSurveyAnalytics returns detailed analytics for a specific survey
func (h *AnalyticsController) GetSurveyAnalytics(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	// Verify survey ownership
	var creatorID string
	ownerQuery := `SELECT creator_id FROM surveys WHERE id = $1`
	err := h.db.QueryRow(context.Background(), ownerQuery, surveyID).Scan(&creatorID)
	if err != nil || creatorID != userID {
		return c.Status(403).JSON(fiber.Map{"error": "Survey not found or access denied"})
	}

	// Get survey details
	surveyDetails := h.getSurveyDetails(surveyID)
	
	// Get response analytics
	responseAnalytics := h.getResponseAnalytics(surveyID)
	
	// Get completion funnel
	completionFunnel := h.getCompletionFunnel(surveyID)
	
	// Get quality metrics
	qualityMetrics := h.getQualityMetrics(surveyID)

	return c.JSON(fiber.Map{
		"survey":           surveyDetails,
		"response_analytics": responseAnalytics,
		"completion_funnel": completionFunnel,
		"quality_metrics":  qualityMetrics,
	})
}

// GetResponseTrends returns response trends over time
func (h *AnalyticsController) GetResponseTrends(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	period := c.Query("period", "7d")
	
	trends := h.getResponseTrends(surveyID, period)
	
	return c.JSON(fiber.Map{
		"trends": trends,
		"period": period,
	})
}

// ExportAnalytics exports analytics data
func (h *AnalyticsController) ExportAnalytics(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	format := c.Query("format", "csv")
	
	filename := fmt.Sprintf("analytics_%s_%s.%s", surveyID[:8], time.Now().Format("20060102"), format)
	
	if format == "csv" {
		c.Set("Content-Type", "text/csv")
		c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
		
		// Generate CSV content
		csvContent := h.generateAnalyticsCSV(surveyID)
		return c.SendString(csvContent)
	}
	
	return c.Status(400).JSON(fiber.Map{"error": "Unsupported format"})
}

// Helper functions for analytics calculations

func (h *AnalyticsController) getSurveyStats(userID, dateFilter string) fiber.Map {
	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_surveys,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_surveys,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_surveys,
			COALESCE(SUM(current_responses), 0) as total_responses
		FROM surveys 
		WHERE creator_id = $1 AND %s
	`, dateFilter)
	
	var stats fiber.Map = make(fiber.Map)
	var totalSurveys, activeSurveys, completedSurveys, totalResponses int
	
	err := h.db.QueryRow(context.Background(), query, userID).Scan(
		&totalSurveys, &activeSurveys, &completedSurveys, &totalResponses)
	if err != nil {
		return fiber.Map{
			"total_surveys": 0,
			"active_surveys": 0,
			"completed_surveys": 0,
			"total_responses": 0,
		}
	}
	
	stats["total_surveys"] = totalSurveys
	stats["active_surveys"] = activeSurveys
	stats["completed_surveys"] = completedSurveys
	stats["total_responses"] = totalResponses
	
	return stats
}

func (h *AnalyticsController) getResponseTrends(userID, period string) []fiber.Map {
	var dateFormat string
	
	switch period {
	case "7d":
		dateFormat = "YYYY-MM-DD"
	case "30d":
		dateFormat = "YYYY-MM-DD"
	case "90d":
		dateFormat = "YYYY-\"W\"WW"
	default:
		dateFormat = "YYYY-MM-DD"
	}
	
	query := fmt.Sprintf(`
		SELECT 
			TO_CHAR(r.created_at, '%s') as date,
			COUNT(*) as responses
		FROM responses r
		JOIN surveys s ON r.survey_id = s.id
		WHERE s.creator_id = $1 
		  AND r.created_at >= NOW() - INTERVAL '%s'
		GROUP BY TO_CHAR(r.created_at, '%s')
		ORDER BY date
	`, dateFormat, period, dateFormat)
	
	rows, err := h.db.Query(context.Background(), query, userID)
	if err != nil {
		return []fiber.Map{}
	}
	defer rows.Close()
	
	var trends []fiber.Map
	for rows.Next() {
		var date string
		var responses int
		
		if err := rows.Scan(&date, &responses); err != nil {
			continue
		}
		
		trends = append(trends, fiber.Map{
			"date": date,
			"responses": responses,
		})
	}
	
	return trends
}

func (h *AnalyticsController) getDemographicBreakdown(userID, dateFilter string) fiber.Map {
	// Get age group breakdown
	ageQuery := fmt.Sprintf(`
		SELECT 
			up.age_range,
			COUNT(*) as count
		FROM responses r
		JOIN surveys s ON r.survey_id = s.id
		JOIN user_profiles up ON r.filler_id = up.user_id
		WHERE s.creator_id = $1 AND r.%s
		GROUP BY up.age_range
	`, dateFilter)
	
	ageRows, _ := h.db.Query(context.Background(), ageQuery, userID)
	defer ageRows.Close()
	
	ageGroups := make(map[string]int)
	for ageRows.Next() {
		var ageRange string
		var count int
		if ageRows.Scan(&ageRange, &count) == nil {
			ageGroups[ageRange] = count
		}
	}
	
	// Get gender breakdown
	genderQuery := fmt.Sprintf(`
		SELECT 
			up.gender,
			COUNT(*) as count
		FROM responses r
		JOIN surveys s ON r.survey_id = s.id
		JOIN user_profiles up ON r.filler_id = up.user_id
		WHERE s.creator_id = $1 AND r.%s
		GROUP BY up.gender
	`, dateFilter)
	
	genderRows, _ := h.db.Query(context.Background(), genderQuery, userID)
	defer genderRows.Close()
	
	genders := make(map[string]int)
	for genderRows.Next() {
		var gender string
		var count int
		if genderRows.Scan(&gender, &count) == nil {
			genders[gender] = count
		}
	}
	
	return fiber.Map{
		"age_groups": ageGroups,
		"genders": genders,
	}
}

func (h *AnalyticsController) getSurveyDetails(surveyID string) fiber.Map {
	query := `
		SELECT title, description, status, current_responses, target_responses, 
		       reward_amount, created_at
		FROM surveys WHERE id = $1
	`
	
	var title, description, status string
	var currentResponses, targetResponses, rewardAmount int
	var createdAt time.Time
	
	err := h.db.QueryRow(context.Background(), query, surveyID).Scan(
		&title, &description, &status, &currentResponses, &targetResponses, &rewardAmount, &createdAt)
	if err != nil {
		return fiber.Map{}
	}
	
	completionRate := float64(currentResponses) / float64(targetResponses) * 100
	
	return fiber.Map{
		"title": title,
		"description": description,
		"status": status,
		"current_responses": currentResponses,
		"target_responses": targetResponses,
		"completion_rate": completionRate,
		"reward_amount": rewardAmount,
		"created_at": createdAt,
	}
}

func (h *AnalyticsController) getResponseAnalytics(surveyID string) fiber.Map {
	// Get response statistics
	statsQuery := `
		SELECT 
			COUNT(*) as total_responses,
			AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as avg_completion_time,
			AVG(quality_score) as avg_quality_score
		FROM responses 
		WHERE survey_id = $1 AND status = 'completed'
	`
	
	var totalResponses int
	var avgCompletionTime, avgQualityScore float64
	
	h.db.QueryRow(context.Background(), statsQuery, surveyID).Scan(
		&totalResponses, &avgCompletionTime, &avgQualityScore)
	
	return fiber.Map{
		"total_responses": totalResponses,
		"avg_completion_time": avgCompletionTime,
		"avg_quality_score": avgQualityScore,
	}
}

func (h *AnalyticsController) getCompletionFunnel(surveyID string) []fiber.Map {
	// Mock completion funnel data
	return []fiber.Map{
		{"step": "Started", "count": 150, "percentage": 100},
		{"step": "50% Complete", "count": 120, "percentage": 80},
		{"step": "Completed", "count": 95, "percentage": 63.3},
	}
}

func (h *AnalyticsController) getQualityMetrics(surveyID string) fiber.Map {
	qualityQuery := `
		SELECT 
			COUNT(CASE WHEN quality_score >= 8 THEN 1 END) as high_quality,
			COUNT(CASE WHEN quality_score >= 5 AND quality_score < 8 THEN 1 END) as medium_quality,
			COUNT(CASE WHEN quality_score < 5 THEN 1 END) as low_quality
		FROM responses 
		WHERE survey_id = $1 AND status = 'completed'
	`
	
	var highQuality, mediumQuality, lowQuality int
	h.db.QueryRow(context.Background(), qualityQuery, surveyID).Scan(
		&highQuality, &mediumQuality, &lowQuality)
	
	return fiber.Map{
		"high_quality": highQuality,
		"medium_quality": mediumQuality,
		"low_quality": lowQuality,
	}
}

func (h *AnalyticsController) generateAnalyticsCSV(surveyID string) string {
	// Generate CSV content for analytics export
	header := "Date,Responses,Completion Rate,Avg Quality Score\n"
	
	// Get daily analytics data
	query := `
		SELECT 
			DATE(created_at) as date,
			COUNT(*) as responses,
			AVG(quality_score) as avg_quality
		FROM responses 
		WHERE survey_id = $1 AND status = 'completed'
		GROUP BY DATE(created_at)
		ORDER BY date DESC
		LIMIT 30
	`
	
	rows, err := h.db.Query(context.Background(), query, surveyID)
	if err != nil {
		return header + "No data available\n"
	}
	defer rows.Close()
	
	content := header
	for rows.Next() {
		var date time.Time
		var responses int
		var avgQuality float64
		
		if rows.Scan(&date, &responses, &avgQuality) == nil {
			content += fmt.Sprintf("%s,%d,%.1f,%.1f\n", 
				date.Format("2006-01-02"), responses, 0.0, avgQuality)
		}
	}
	
	return content
}