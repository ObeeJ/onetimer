package controllers

import (
	"encoding/json"
	"onetimer-backend/cache"
	"onetimer-backend/database"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SurveyController struct {
	cache *cache.Cache
	db    *database.SupabaseDB
	repo  *repository.SurveyRepository
}

func NewSurveyController(db *database.SupabaseDB, cache *cache.Cache) *SurveyController {
	return &SurveyController{
		cache: cache,
		db:    db,
		repo:  repository.NewSurveyRepository(db),
	}
}

func (h *SurveyController) CreateSurvey(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError("Unauthorized survey creation attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		utils.LogError("Failed to parse survey request: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	// Validate required fields
	if req.Title == "" || req.Description == "" {
		utils.LogWarn("Survey missing required fields - title or description empty")
		return c.Status(400).JSON(fiber.Map{"error": "Title and description are required"})
	}

	// Parse creator ID
	creatorID, err := uuid.Parse(userID)
	if err != nil {
		utils.LogError("Invalid creator ID: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Create survey ID and object
	surveyID := uuid.New()
	survey := models.Survey{
		ID:                surveyID,
		CreatorID:         creatorID,
		Title:             req.Title,
		Description:       req.Description,
		Category:          &req.Category,
		RewardAmount:      req.RewardAmount,
		TargetResponses:   req.TargetCount,
		EstimatedDuration: req.Duration,
		Status:            "pending",
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	var questions []models.Question
	for _, q := range req.Questions {
		options, _ := json.Marshal(q.Options)
		questions = append(questions, models.Question{
			ID:          uuid.New(),
			SurveyID:    surveyID,
			Type:        q.Type,
			Title:       q.Title,
			Description: &q.Description,
			Required:    q.Required,
			Options:     options,
			OrderIndex:  q.Order,
		})
	}

	if err := h.repo.CreateSurvey(&survey, questions, 0); err != nil {
		utils.LogError("Failed to create survey in database: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save survey to database"})
	}
	utils.LogInfo("Survey created successfully: %s by user %s", surveyID, userID)

	// Return success response with survey details
	return c.Status(201).JSON(fiber.Map{
		"ok":      true,
		"success": true,
		"data": fiber.Map{
			"survey_id":      survey.ID,
			"title":          survey.Title,
			"description":    survey.Description,
			"category":       survey.Category,
			"reward":         survey.RewardAmount,
			"target_count":   survey.TargetResponses,
			"estimated_time": survey.EstimatedDuration,
			"status":         survey.Status,
			"created_at":     survey.CreatedAt,
			"question_count": len(req.Questions),
		},
		"message": "Survey created successfully and submitted for review",
	})
}

func (h *SurveyController) GetSurveys(c *fiber.Ctx) error {
	surveys, err := h.repo.GetAll(c.Context(), 100, 0, "")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys", "details": err.Error()})
	}

	if surveys == nil {
		surveys = []models.Survey{}
	}

	return c.JSON(fiber.Map{"data": surveys, "success": true})
}

func (h *SurveyController) GetSurvey(c *fiber.Ctx) error {
	id := c.Params("id")
	surveyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	questions, err := h.repo.GetQuestions(c.Context(), surveyID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	return c.JSON(fiber.Map{"data": fiber.Map{"survey": survey, "questions": questions}, "questions": questions, "reward": survey.RewardAmount})
}

func (h *SurveyController) UpdateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

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
	survey.Category = &req.Category
	survey.RewardAmount = req.RewardAmount
	survey.TargetResponses = req.TargetCount
	survey.EstimatedDuration = req.Duration
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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Answers map[string]interface{} `json:"answers"`
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

	answers, _ := json.Marshal(req.Answers)

	response := models.Response{
		ID:          uuid.New(),
		SurveyID:    surveyUUID,
		FillerID:    uuid.MustParse(userID),
		Answers:     answers,
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
		ID:        uuid.New(),
		UserID:    uuid.MustParse(userID),
		SurveyID:  &surveyUUID,
		Amount:    survey.RewardAmount,
		Type:      "survey_completion",
		Status:    "completed",
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
		"reward":          survey.RewardAmount,
		"responses_count": len(req.Answers),
	})
}

func (h *SurveyController) GetSurveyResponses(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	limit := c.QueryInt("limit", 10)
	offset := c.QueryInt("offset", 0)

	responses, total, err := h.repo.GetSurveyResponses(c.Context(), uuid.MustParse(surveyID), limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch survey responses"})
	}

	return c.JSON(fiber.Map{
		"responses": responses,
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

func (h *SurveyController) GetResponseDetails(c *fiber.Ctx) error {
	surveyID := c.Params("survey_id")
	responseID := c.Params("response_id")

	response, err := h.repo.GetResponseDetails(c.Context(), uuid.MustParse(surveyID), uuid.MustParse(responseID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch response details"})
	}

	return c.JSON(fiber.Map{
		"response": response,
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
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
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
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

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

	if err = h.repo.CreateSurvey(&surveyData, []models.Question{}, 0); err != nil {
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
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

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

	if err := h.repo.CreateSurvey(&newSurvey, []models.Question{}, 0); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to duplicate survey"})
	}

	return c.JSON(fiber.Map{
		"ok":            true,
		"original_id":   surveyID,
		"new_survey_id": newSurveyID,
		"user_id":       userID,
		"message":       "Survey duplicated successfully",
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
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
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

	if err := h.repo.CreateSurvey(&survey, []models.Question{}, 0); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save draft"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"draft_id": draftID,
		"user_id":  userID,
		"message":  "Survey draft saved successfully",
	})
}
