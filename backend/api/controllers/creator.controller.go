package controllers

import (
	"encoding/csv"
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CreatorController struct {
	cache *cache.Cache
}

func NewCreatorController(cache *cache.Cache) *CreatorController {
	return &CreatorController{cache: cache}
}

func (h *CreatorController) GetDashboard(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)
	
	dashboard := fiber.Map{
		"total_surveys":    12,
		"active_surveys":   8,
		"total_responses":  1450,
		"credits_balance":  2500,
		"monthly_responses": 340,
	}

	return c.JSON(dashboard)
}

func (h *CreatorController) GetMySurveys(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	surveys := []models.Survey{
		{
			ID:               uuid.New(),
			CreatorID:        uuid.MustParse(userID),
			Title:           "My Consumer Survey",
			Description:     "Understanding consumer behavior",
			Status:          "active",
			CurrentResponses: 45,
			MaxResponses:    100,
			CreatedAt:       time.Now().AddDate(0, 0, -5),
		},
		{
			ID:               uuid.New(),
			CreatorID:        uuid.MustParse(userID),
			Title:           "Product Feedback Survey",
			Description:     "Collecting product feedback",
			Status:          "draft",
			CurrentResponses: 0,
			MaxResponses:    200,
			CreatedAt:       time.Now().AddDate(0, 0, -2),
		},
	}

	return c.JSON(fiber.Map{"surveys": surveys})
}

func (h *CreatorController) UpdateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	_ = c.Locals("user_id").(string)
	
	var survey models.Survey
	if err := c.BodyParser(&survey); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"message":   "Survey updated successfully",
	})
}

func (h *CreatorController) DeleteSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	
	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"message":   "Survey deleted successfully",
	})
}

func (h *CreatorController) GetSurveyResponses(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	
	responses := []models.Response{
		{
			ID:          uuid.New(),
			SurveyID:    uuid.MustParse(surveyID),
			FillerID:    uuid.New(),
			Status:      "completed",
			StartedAt:   time.Now().AddDate(0, 0, -1),
			CompletedAt: &[]time.Time{time.Now().AddDate(0, 0, -1).Add(5 * time.Minute)}[0],
		},
	}

	return c.JSON(fiber.Map{"responses": responses})
}

func (h *CreatorController) GetAnalytics(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	
	analytics := fiber.Map{
		"survey_id":        surveyID,
		"total_responses":  145,
		"completion_rate":  87.5,
		"avg_time":         "6m 30s",
		"demographics": fiber.Map{
			"age_groups": fiber.Map{
				"18-25": 35,
				"26-35": 45,
				"36-45": 40,
				"46+":   25,
			},
		},
	}

	return c.JSON(analytics)
}

func (h *CreatorController) GetCredits(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)
	
	credits := fiber.Map{
		"balance":      2500,
		"spent":        7500,
		"transactions": []fiber.Map{
			{
				"id":     uuid.New().String(),
				"type":   "purchase",
				"amount": 1000,
				"date":   time.Now().AddDate(0, 0, -2),
			},
			{
				"id":     uuid.New().String(),
				"type":   "spent",
				"amount": -500,
				"date":   time.Now().AddDate(0, 0, -5),
			},
		},
	}

	return c.JSON(credits)
}

func (h *CreatorController) ExportSurveyResponses(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	format := c.Query("format", "csv")
	
	// Mock responses for now
	responses := []fiber.Map{
		{
			"id":           "resp_001",
			"filler_email": "user1@example.com",
			"completed_at": time.Now().AddDate(0, 0, -1),
			"answers": map[string]interface{}{
				"q1": "Very satisfied",
				"q2": 8,
				"q3": "Great product",
			},
		},
		{
			"id":           "resp_002",
			"filler_email": "user2@example.com",
			"completed_at": time.Now().AddDate(0, 0, -2),
			"answers": map[string]interface{}{
				"q1": "Satisfied",
				"q2": 7,
				"q3": "Good value",
			},
		},
	}
	
	switch format {
	case "csv":
		return h.exportCSV(c, responses, surveyID)
	case "json":
		return h.exportJSON(c, responses, surveyID)
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Unsupported format"})
	}
}

func (h *CreatorController) exportCSV(c *fiber.Ctx, responses []fiber.Map, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.csv", surveyID[:8], time.Now().Format("20060102"))
	
	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	writer := csv.NewWriter(c)
	defer writer.Flush()

	if len(responses) == 0 {
		writer.Write([]string{"No responses found"})
		return nil
	}

	// Write header
	header := []string{"Response ID", "Filler Email", "Completed At", "Q1", "Q2", "Q3"}
	writer.Write(header)

	// Write data rows
	for _, response := range responses {
		answers := response["answers"].(map[string]interface{})
		row := []string{
			response["id"].(string),
			response["filler_email"].(string),
			response["completed_at"].(time.Time).Format("2006-01-02 15:04:05"),
			fmt.Sprintf("%v", answers["q1"]),
			fmt.Sprintf("%v", answers["q2"]),
			fmt.Sprintf("%v", answers["q3"]),
		}
		writer.Write(row)
	}

	return nil
}

func (h *CreatorController) exportJSON(c *fiber.Ctx, responses []fiber.Map, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.json", surveyID[:8], time.Now().Format("20060102"))
	
	c.Set("Content-Type", "application/json")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	exportData := fiber.Map{
		"survey_id":       surveyID,
		"exported_at":     time.Now(),
		"total_responses": len(responses),
		"responses":       responses,
	}

	return c.JSON(exportData)
}

// GetSurveyAnalytics returns detailed analytics for a survey
func (h *CreatorController) GetSurveyAnalytics(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	
	analytics := fiber.Map{
		"survey_id":        surveyID,
		"total_responses":  145,
		"completion_rate":  87.5,
		"avg_time":         "6m 30s",
		"bounce_rate":      12.5,
		"quality_score":    8.2,
		"demographics": fiber.Map{
			"age_groups": fiber.Map{
				"18-25": 35,
				"26-35": 45,
				"36-45": 40,
				"46+":   25,
			},
			"gender": fiber.Map{
				"male":   75,
				"female": 70,
			},
			"locations": []fiber.Map{
				{"state": "Lagos", "count": 45},
				{"state": "Abuja", "count": 32},
				{"state": "Kano", "count": 28},
			},
		},
		"response_trends": []fiber.Map{
			{"date": "2024-01-15", "responses": 12},
			{"date": "2024-01-16", "responses": 18},
			{"date": "2024-01-17", "responses": 15},
		},
	}

	return c.JSON(analytics)
}

// PauseSurvey pauses an active survey
func (h *CreatorController) PauseSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)
	
	// TODO: Update survey status in database
	
	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"user_id":   userID,
		"status":    "paused",
		"message":   "Survey paused successfully",
	})
}

// ResumeSurvey resumes a paused survey
func (h *CreatorController) ResumeSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)
	
	// TODO: Update survey status in database
	
	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"user_id":   userID,
		"status":    "active",
		"message":   "Survey resumed successfully",
	})
}

// DuplicateSurvey creates a copy of an existing survey
func (h *CreatorController) DuplicateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)
	
	newSurveyID := uuid.New()
	
	return c.JSON(fiber.Map{
		"ok":             true,
		"original_id":    surveyID,
		"new_survey_id":  newSurveyID,
		"user_id":        userID,
		"message":        "Survey duplicated successfully",
	})
}

// GetResponseDetails returns detailed response information
func (h *CreatorController) GetResponseDetails(c *fiber.Ctx) error {
	surveyID := c.Params("survey_id")
	responseID := c.Params("response_id")
	
	response := fiber.Map{
		"id":           responseID,
		"survey_id":    surveyID,
		"filler_email": "user@example.com",
		"started_at":   time.Now().AddDate(0, 0, -1),
		"completed_at": time.Now().AddDate(0, 0, -1).Add(5 * time.Minute),
		"time_taken":   "5m 23s",
		"quality_score": 8.5,
		"answers": []fiber.Map{
			{"question_id": "q1", "question": "Age group?", "answer": "25-35"},
			{"question_id": "q2", "question": "Feedback?", "answer": "Great product!"},
		},
		"metadata": fiber.Map{
			"ip_address": "192.168.1.1",
			"user_agent": "Mozilla/5.0...",
			"device":     "mobile",
		},
	}

	return c.JSON(response)
}