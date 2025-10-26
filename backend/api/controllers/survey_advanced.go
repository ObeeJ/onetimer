package controllers

import (
	"encoding/json"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SurveyAdvancedHandler struct {
	cache *cache.Cache
	db    *pgxpool.Pool
	repo  *repository.SurveyRepository
}

func NewSurveyAdvancedHandler(cache *cache.Cache, db *pgxpool.Pool) *SurveyAdvancedHandler {
	var repo *repository.SurveyRepository
	if db != nil {
		repo = repository.NewSurveyRepository(db)
	}
	return &SurveyAdvancedHandler{
		cache: cache,
		db:    db,
		repo:  repo,
	}
}

func (h *SurveyAdvancedHandler) GetSurveyQuestions(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if h.repo == nil {
		// Mock questions for development
		questions := []models.Question{
			{
				ID:       uuid.New(),
				SurveyID: id,
				Type:     "multiple_choice",
				Title:    "What is your age group?",
				Required: true,
				Order:    1,
				Options:  []string{"18-25", "26-35", "36-45", "46-55", "55+"},
			},
			{
				ID:       uuid.New(),
				SurveyID: id,
				Type:     "open_ended",
				Title:    "What factors influence your purchasing decisions?",
				Required: false,
				Order:    2,
			},
		}
		return c.JSON(fiber.Map{"data": questions, "success": true})
	}

	questions, err := h.repo.GetQuestions(c.Context(), id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions", "success": false})
	}

	return c.JSON(fiber.Map{"data": questions, "success": true})
}

func (h *SurveyAdvancedHandler) StartSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	// Create session for survey progress
	sessionKey := "survey_session:" + surveyID + ":" + userID
	sessionData := fiber.Map{
		"survey_id":  surveyID,
		"user_id":    userID,
		"started_at": time.Now(),
		"progress":   0,
		"answers":    make(map[string]interface{}),
	}

	h.cache.Set(c.Context(), sessionKey, sessionData)

	return c.JSON(fiber.Map{
		"ok":         true,
		"session_id": sessionKey,
		"started_at": time.Now(),
		"success":    true,
	})
}

func (h *SurveyAdvancedHandler) SaveProgress(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	var req struct {
		Progress int                    `json:"progress"`
		Answers  map[string]interface{} `json:"answers"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request", "success": false})
	}

	// Update session data
	sessionKey := "survey_session:" + surveyID + ":" + userID
	var sessionData fiber.Map
	if err := h.cache.Get(c.Context(), sessionKey, &sessionData); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Session not found", "success": false})
	}

	sessionData["progress"] = req.Progress
	sessionData["answers"] = req.Answers
	sessionData["updated_at"] = time.Now()

	h.cache.Set(c.Context(), sessionKey, sessionData)

	return c.JSON(fiber.Map{
		"ok":       true,
		"progress": req.Progress,
		"saved_at": time.Now(),
		"success":  true,
	})
}

func (h *SurveyAdvancedHandler) PauseSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if h.repo != nil {
		err = h.repo.UpdateStatus(c.Context(), id, "paused")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to pause survey", "success": false})
		}
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "paused",
		"success": true,
	})
}

func (h *SurveyAdvancedHandler) ResumeSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if h.repo != nil {
		err = h.repo.UpdateStatus(c.Context(), id, "active")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to resume survey", "success": false})
		}
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "active",
		"success": true,
	})
}

func (h *SurveyAdvancedHandler) ImportSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	file, err := c.FormFile("survey_file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded", "success": false})
	}

	// Read and parse survey file (JSON format expected)
	fileContent, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file", "success": false})
	}
	defer fileContent.Close()

	var surveyData models.Survey
	if err := json.NewDecoder(fileContent).Decode(&surveyData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey format", "success": false})
	}

	// Set survey metadata
	surveyData.ID = uuid.New()
	surveyData.CreatorID, _ = uuid.Parse(userID)
	surveyData.Status = "draft"

	if h.repo != nil {
		err = h.repo.Create(c.Context(), &surveyData)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to import survey", "success": false})
		}
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"survey":  surveyData,
		"message": "Survey imported successfully",
		"success": true,
	})
}