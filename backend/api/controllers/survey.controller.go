
package controllers

import (
	"encoding/json"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"onetimer-backend/services"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SurveyController struct {
	cache          *cache.Cache
	db             *pgxpool.Pool
	repo           *repository.SurveyRepository
	billingService *services.BillingService
}

func NewSurveyController(db *pgxpool.Pool, cache *cache.Cache) *SurveyController {
	var repo *repository.SurveyRepository
	if db != nil {
		repo = repository.NewSurveyRepository(db)
	}
	return &SurveyController{
		cache:          cache,
		db:             db,
		repo:           repo,
		billingService: services.NewBillingService(),
	}
}

func (h *SurveyController) CreateSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	if req.Title == "" || req.Description == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Title and description are required"})
	}

	if len(req.Questions) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one question is required"})
	}

	// Validate reward amount based on survey complexity
	if err := h.billingService.ValidateRewardRange(len(req.Questions), req.RewardAmount); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Calculate total survey cost
	billing := services.SurveyBilling{
		Pages:              len(req.Questions),
		RewardPerUser:      req.RewardAmount,
		Respondents:        req.TargetCount,
		PriorityPlacement:  req.PriorityPlacement,
		DemographicFilters: len(req.DemographicFilters),
		ExtraDays:          req.ExtraDays,
		DataExport:         req.DataExport,
	}

	billingResult, err := h.billingService.CalculateSurveyCost(billing)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Failed to calculate survey cost: " + err.Error()})
	}

	surveyID := uuid.New()

	survey := models.Survey{
		ID:               surveyID,
		CreatorID:        uuid.MustParse(userID),
		Title:            req.Title,
		Description:      req.Description,
		Category:         req.Category,
		Reward:           req.RewardAmount,
		MaxResponses:     req.TargetCount,
		EstimatedTime:    req.Duration,
		Status:           "pending",
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := h.repo.Create(c.Context(), &survey); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create survey"})
	}

	for _, q := range req.Questions {
		question := models.Question{
			ID:       uuid.New(),
			SurveyID: surveyID,
			Type:     q.Type,
			Title:    q.Title,
			Required: q.Required,
			Options:  q.Options,
			Scale:    q.Scale,
			Rows:     q.Rows,
			Cols:     q.Cols,
			Order:    q.Order,
		}
		if err := h.repo.CreateQuestion(c.Context(), &question); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create question"})
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":           true,
		"survey":       survey,
		"billing":      billingResult,
		"total_cost":   billingResult.TotalCost,
		"platform_fee": billingResult.PlatformFee,
		"message":      "Survey created successfully and submitted for review",
	})
}

func (h *SurveyController) GetSurveys(c *fiber.Ctx) error {
	// Handle case when database is not available
	if h.repo == nil {
		// Return mock data when database is unavailable
		mockSurveys := []models.Survey{
			{
				ID:               uuid.New(),
				Title:            "Sample Survey",
				Description:      "This is a sample survey for testing",
				Category:         "general",
				Reward:           500,
				MaxResponses:     100,
				CurrentResponses: 0,
				EstimatedTime:    5,
				Status:           "active",
				CreatedAt:        time.Now(),
				UpdatedAt:        time.Now(),
			},
		}
		return c.JSON(fiber.Map{"data": mockSurveys, "success": true})
	}

	surveys, err := h.repo.GetAll(c.Context(), 100, 0, "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}

	return c.JSON(fiber.Map{"data": surveys, "success": true})
}

func (h *SurveyController) GetSurvey(c *fiber.Ctx) error {
	id := c.Params("id")
	surveyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	// Handle case when database is not available
	if h.repo == nil {
		mockSurvey := models.Survey{
			ID:               surveyID,
			Title:            "Sample Survey",
			Description:      "This is a sample survey for testing",
			Category:         "general",
			Reward:           500,
			MaxResponses:     100,
			CurrentResponses: 0,
			EstimatedTime:    5,
			Status:           "active",
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}
		mockQuestions := []models.Question{
			{
				ID:       uuid.New(),
				SurveyID: surveyID,
				Type:     "multiple_choice",
				Title:    "Sample Question",
				Required: true,
				Options:  []string{"Option 1", "Option 2", "Option 3"},
				Order:    1,
			},
		}
		return c.JSON(fiber.Map{"data": fiber.Map{"survey": mockSurvey, "questions": mockQuestions}, "questions": mockQuestions, "reward": mockSurvey.Reward})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	questions, err := h.repo.GetQuestions(c.Context(), surveyID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	return c.JSON(fiber.Map{"data": fiber.Map{"survey": survey, "questions": questions}, "questions": questions, "reward": survey.Reward})
}

func (h *SurveyController) UpdateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	if survey.CreatorID.String() != userID {
		return c.Status(403).JSON(fiber.Map{"error": "You are not authorized to update this survey"})
	}

	survey.Title = req.Title
	survey.Description = req.Description
	survey.Category = req.Category
	survey.Reward = req.RewardAmount
	survey.MaxResponses = req.TargetCount
	survey.EstimatedTime = req.Duration
	survey.UpdatedAt = time.Now()

	if err := h.repo.Update(c.Context(), survey); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update survey"})
	}

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"user_id":   userID,
		"message":   "Survey updated successfully",
	})
}

func (h *SurveyController) DeleteSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	if survey.CreatorID.String() != userID {
		return c.Status(403).JSON(fiber.Map{"error": "You are not authorized to delete this survey"})
	}

	if err := h.repo.Delete(c.Context(), surveyUUID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete survey"})
	}

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"message":   "Survey deleted successfully",
	})
}

func (h *SurveyController) SubmitResponse(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	var req struct {
		Responses []models.Answer `json:"responses"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	response := models.Response{
		ID:          uuid.New(),
		SurveyID:    surveyUUID,
		FillerID:    uuid.MustParse(userID),
		Answers:     req.Responses,
		Status:      "completed",
		StartedAt:   time.Now(),
		CompletedAt: &time.Time{},
	}

	if err := h.repo.CreateResponse(c.Context(), &response); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to submit response"})
	}

	if err := h.repo.IncrementResponseCount(c.Context(), surveyUUID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update response count"})
	}

	earning := models.Earning{
		ID:       uuid.New(),
		UserID:   uuid.MustParse(userID),
		SurveyID: &surveyUUID,
		Amount:   survey.Reward,
		Type:     "survey_completion",
		Status:   "completed",
		CreatedAt: time.Now(),
	}

	if err := h.repo.CreateEarning(c.Context(), &earning); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create earning"})
	}

	return c.JSON(fiber.Map{
		"ok":              true,
		"success":         true,
		"message":         "Survey submitted successfully! Your reward has been added to your account.",
		"survey_id":       surveyID,
		"reward":          survey.Reward,
		"responses_count": len(req.Responses),
	})
}

func (h *SurveyController) GetSurveyQuestions(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	questions, err := h.repo.GetQuestions(c.Context(), id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions", "success": false})
	}

	return c.JSON(fiber.Map{"data": questions, "success": true})
}

func (h *SurveyController) StartSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		userID = c.Locals("user_id").(string)
	}

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

func (h *SurveyController) SaveProgress(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		userID = c.Locals("user_id").(string)
	}

	var req struct {
		Progress int                    `json:"progress"`
		Answers  map[string]interface{} `json:"answers"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request", "success": false})
	}

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

func (h *SurveyController) PauseSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if err = h.repo.UpdateStatus(c.Context(), id, "paused"); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to pause survey", "success": false})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "paused",
		"success": true,
	})
}

func (h *SurveyController) ResumeSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	id, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if err = h.repo.UpdateStatus(c.Context(), id, "active"); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to resume survey", "success": false})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "active",
		"success": true,
	})
}

func (h *SurveyController) ImportSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	file, err := c.FormFile("survey_file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded", "success": false})
	}

	fileContent, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file", "success": false})
	}
	defer fileContent.Close()

	var surveyData models.Survey
	if err := json.NewDecoder(fileContent).Decode(&surveyData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey format", "success": false})
	}

	surveyData.ID = uuid.New()
	surveyData.CreatorID, _ = uuid.Parse(userID)
	surveyData.Status = "draft"

	if err = h.repo.Create(c.Context(), &surveyData); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to import survey", "success": false})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"survey":  surveyData,
		"message": "Survey imported successfully",
		"success": true,
	})
}

func (h *SurveyController) DuplicateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	originalSurvey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	newSurveyID := uuid.New()
	newSurvey := *originalSurvey
	newSurvey.ID = newSurveyID
	newSurvey.CreatorID = uuid.MustParse(userID)
	newSurvey.Status = "draft"
	newSurvey.CreatedAt = time.Now()
	newSurvey.UpdatedAt = time.Now()

	if err := h.repo.Create(c.Context(), &newSurvey); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to duplicate survey"})
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":             true,
		"original_id":    surveyID,
		"new_survey_id":  newSurveyID,
		"user_id":        userID,
		"message":        "Survey duplicated successfully",
	})
}

func (h *SurveyController) GetSurveyTemplates(c *fiber.Ctx) error {
	templates := []fiber.Map{
		{
			"id":          "template_001",
			"name":        "Customer Satisfaction Survey",
			"description": "Measure customer satisfaction and feedback",
			"category":    "business",
			"questions":   5,
		},
		{
			"id":          "template_002",
			"name":        "Market Research Survey",
			"description": "Understand market trends and preferences",
			"category":    "research",
			"questions":   8,
		},
	}

	return c.JSON(fiber.Map{"templates": templates})
}

func (h *SurveyController) SaveSurveyDraft(c *fiber.Ctx) error {
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		userID = c.Locals("user_id").(string)
	}

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	draftID := uuid.New()
	survey := models.Survey{
		ID:          draftID,
		CreatorID:   uuid.MustParse(userID),
		Title:       req.Title,
		Description: req.Description,
		Status:      "draft",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repo.Create(c.Context(), &survey); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save draft"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"draft_id": draftID,
		"user_id":  userID,
		"message":  "Survey draft saved successfully",
	})
}
