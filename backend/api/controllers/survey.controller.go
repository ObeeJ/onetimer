package controllers

import (
	"context"
	"encoding/json"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SurveyController struct {
	cache *cache.Cache
	repo  *repository.SurveyRepository
}

func NewSurveyController(cache *cache.Cache, repo *repository.SurveyRepository) *SurveyController {
	return &SurveyController{
		cache: cache,
		repo:  repo,
	}
}

func (h *SurveyController) CreateSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ CreateSurvey request")

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized survey creation attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Failed to parse survey request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	utils.LogInfo(ctx, "Survey creation request", "user_id", userID, "title", req.Title, "questions", len(req.Questions))

	// Validate required fields
	if req.Title == "" || req.Description == "" {
		utils.LogWarn(ctx, "⚠️ Validation failed: missing required fields", "has_title", req.Title != "", "has_description", req.Description != "")
		return c.Status(400).JSON(fiber.Map{"error": "Title and description are required"})
	}

	// Parse creator ID
	creatorID, err := uuid.Parse(userID)
	if err != nil {
		utils.LogError(ctx, "⚠️ Invalid creator ID", err, "user_id", userID)
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

	utils.LogInfo(ctx, "Creating survey in database", "survey_id", surveyID, "question_count", len(questions), "reward", req.RewardAmount)

	if err := h.repo.CreateSurvey(c.Context(), &survey, questions, 0); err != nil {
		utils.LogError(ctx, "⚠️ Database error: failed to create survey", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save survey to database"})
	}

	utils.LogInfo(ctx, "✅ Survey created successfully", "survey_id", surveyID, "user_id", userID, "status", "pending")

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
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetSurveys request")

	// Set timeout for the request
	dbCtx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()

	// Check cache first
	cacheKey := "surveys:active:list"
	var cachedSurveys []models.Survey
	if err := h.cache.Get(dbCtx, cacheKey, &cachedSurveys); err == nil {
		utils.LogInfo(ctx, "✅ Surveys retrieved from cache", "count", len(cachedSurveys))
		return c.JSON(fiber.Map{"data": cachedSurveys, "success": true, "cached": true})
	}

	utils.LogInfo(ctx, "Cache miss, fetching from database")

	// Get only active surveys with limit
	surveys, err := h.repo.GetAll(dbCtx, 50, 0, "active")
	if err != nil {
		// Return empty array on timeout or error instead of failing
		utils.LogError(ctx, "⚠️ Database error: failed to fetch surveys", err)
		return c.JSON(fiber.Map{"data": []models.Survey{}, "success": true, "error": "Temporary service issue"})
	}

	if surveys == nil {
		surveys = []models.Survey{}
	}

	// Cache the results for 5 minutes
	h.cache.Set(dbCtx, cacheKey, surveys)

	utils.LogInfo(ctx, "✅ Surveys retrieved successfully", "count", len(surveys), "cached", true)

	return c.JSON(fiber.Map{"data": surveys, "success": true})
}

func (h *SurveyController) GetSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	id := c.Params("id")
	utils.LogInfo(ctx, "→ GetSurvey request", "survey_id", id)

	surveyID, err := uuid.Parse(id)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", id)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Survey not found", "survey_id", id)
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	utils.LogInfo(ctx, "Survey found", "survey_id", id, "title", survey.Title, "status", survey.Status)

	questions, err := h.repo.GetQuestions(c.Context(), surveyID)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch questions", err, "survey_id", id)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}

	utils.LogInfo(ctx, "✅ Survey retrieved successfully", "survey_id", id, "question_count", len(questions))

	return c.JSON(fiber.Map{"data": fiber.Map{"survey": survey, "questions": questions}, "questions": questions, "reward": survey.RewardAmount})
}

func (h *SurveyController) UpdateSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ UpdateSurvey request", "survey_id", surveyID)

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized update attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Failed to parse update request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Survey not found for update", "survey_id", surveyID)
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	if survey.CreatorID.String() != userID {
		utils.LogWarn(ctx, "⚠️ Authorization failed: user not survey creator", "survey_id", surveyID, "creator_id", survey.CreatorID.String(), "user_id", userID)
		return c.Status(403).JSON(fiber.Map{"error": "You are not authorized to update this survey"})
	}

	utils.LogInfo(ctx, "Updating survey", "survey_id", surveyID, "title", req.Title)

	survey.Title = req.Title
	survey.Description = req.Description
	survey.Category = &req.Category
	survey.RewardAmount = req.RewardAmount
	survey.TargetResponses = req.TargetCount
	survey.EstimatedDuration = req.Duration
	survey.UpdatedAt = time.Now()

	if err := h.repo.Update(c.Context(), survey); err != nil {
		utils.LogError(ctx, "⚠️ Database error: failed to update survey", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update survey"})
	}

	utils.LogInfo(ctx, "✅ Survey updated successfully", "survey_id", surveyID, "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"user_id":   userID,
		"message":   "Survey updated successfully",
	})
}

func (h *SurveyController) DeleteSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ DeleteSurvey request", "survey_id", surveyID)

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized delete attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Survey not found for deletion", "survey_id", surveyID)
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	if survey.CreatorID.String() != userID {
		utils.LogWarn(ctx, "⚠️ Authorization failed: user not survey creator", "survey_id", surveyID, "creator_id", survey.CreatorID.String(), "user_id", userID)
		return c.Status(403).JSON(fiber.Map{"error": "You are not authorized to delete this survey"})
	}

	utils.LogInfo(ctx, "Deleting survey", "survey_id", surveyID, "title", survey.Title)

	if err := h.repo.Delete(c.Context(), surveyUUID); err != nil {
		utils.LogError(ctx, "⚠️ Database error: failed to delete survey", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete survey"})
	}

	utils.LogInfo(ctx, "✅ Survey deleted successfully", "survey_id", surveyID, "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"message":   "Survey deleted successfully",
	})
}

func (h *SurveyController) SubmitResponse(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ SubmitResponse request", "survey_id", surveyID)

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized response submission")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Answers map[string]interface{} `json:"answers"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Failed to parse response", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing survey response", "survey_id", surveyID, "user_id", userID, "answer_count", len(req.Answers))

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	survey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Survey not found", "survey_id", surveyID)
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
		utils.LogError(ctx, "⚠️ Database error: failed to create response", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to submit response"})
	}

	utils.LogInfo(ctx, "Response saved, updating count", "response_id", response.ID)

	if err := h.repo.IncrementResponseCount(c.Context(), surveyUUID); err != nil {
		utils.LogError(ctx, "⚠️ Failed to update response count", err, "survey_id", surveyID)
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
		utils.LogError(ctx, "⚠️ Failed to create earning", err, "survey_id", surveyID, "amount", survey.RewardAmount)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create earning"})
	}

	utils.LogInfo(ctx, "✅ Survey response submitted successfully", "survey_id", surveyID, "user_id", userID, "reward", survey.RewardAmount, "earning_id", earning.ID)

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
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	limit := c.QueryInt("limit", 10)
	offset := c.QueryInt("offset", 0)
	utils.LogInfo(ctx, "→ GetSurveyResponses request", "survey_id", surveyID, "limit", limit, "offset", offset)

	responses, total, err := h.repo.GetSurveyResponses(c.Context(), uuid.MustParse(surveyID), limit, offset)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch survey responses", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch survey responses"})
	}

	utils.LogInfo(ctx, "✅ Survey responses retrieved", "survey_id", surveyID, "count", len(responses), "total", total)

	return c.JSON(fiber.Map{
		"responses": responses,
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

func (h *SurveyController) GetResponseDetails(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("survey_id")
	responseID := c.Params("response_id")
	utils.LogInfo(ctx, "→ GetResponseDetails request", "survey_id", surveyID, "response_id", responseID)

	response, err := h.repo.GetResponseDetails(c.Context(), uuid.MustParse(surveyID), uuid.MustParse(responseID))
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch response details", err, "survey_id", surveyID, "response_id", responseID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch response details"})
	}

	utils.LogInfo(ctx, "✅ Response details retrieved", "survey_id", surveyID, "response_id", responseID)

	return c.JSON(fiber.Map{
		"response": response,
	})
}

func (h *SurveyController) GetSurveyQuestions(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ GetSurveyQuestions request", "survey_id", surveyID)

	id, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	questions, err := h.repo.GetQuestions(c.Context(), id)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch questions", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions", "success": false})
	}

	utils.LogInfo(ctx, "✅ Questions retrieved", "survey_id", surveyID, "count", len(questions))

	return c.JSON(fiber.Map{"data": questions, "success": true})
}

func (h *SurveyController) StartSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
	}

	utils.LogInfo(ctx, "→ StartSurvey request", "survey_id", surveyID, "user_id", userID)

	sessionKey := "survey_session:" + surveyID + ":" + userID
	sessionData := fiber.Map{
		"survey_id":  surveyID,
		"user_id":    userID,
		"started_at": time.Now(),
		"progress":   0,
		"answers":    make(map[string]interface{}),
	}

	h.cache.Set(c.Context(), sessionKey, sessionData)

	utils.LogInfo(ctx, "✅ Survey session created", "session_key", sessionKey)

	return c.JSON(fiber.Map{
		"ok":         true,
		"session_id": sessionKey,
		"started_at": time.Now(),
		"success":    true,
	})
}

func (h *SurveyController) SaveProgress(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
	}

	utils.LogInfo(ctx, "→ SaveProgress request", "survey_id", surveyID, "user_id", userID)

	var req struct {
		Progress int                    `json:"progress"`
		Answers  map[string]interface{} `json:"answers"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Failed to parse progress request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request", "success": false})
	}

	sessionKey := "survey_session:" + surveyID + ":" + userID
	var sessionData fiber.Map
	if err := h.cache.Get(c.Context(), sessionKey, &sessionData); err != nil {
		utils.LogWarn(ctx, "⚠️ Session not found", "session_key", sessionKey)
		return c.Status(404).JSON(fiber.Map{"error": "Session not found", "success": false})
	}

	sessionData["progress"] = req.Progress
	sessionData["answers"] = req.Answers
	sessionData["updated_at"] = time.Now()

	h.cache.Set(c.Context(), sessionKey, sessionData)

	utils.LogInfo(ctx, "✅ Progress saved", "session_key", sessionKey, "progress", req.Progress)

	return c.JSON(fiber.Map{
		"ok":       true,
		"progress": req.Progress,
		"saved_at": time.Now(),
		"success":  true,
	})
}

func (h *SurveyController) PauseSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ PauseSurvey request", "survey_id", surveyID)

	id, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if err = h.repo.UpdateStatus(c.Context(), id, "paused"); err != nil {
		utils.LogError(ctx, "⚠️ Failed to pause survey", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to pause survey", "success": false})
	}

	utils.LogInfo(ctx, "✅ Survey paused", "survey_id", surveyID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "paused",
		"success": true,
	})
}

func (h *SurveyController) ResumeSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ ResumeSurvey request", "survey_id", surveyID)

	id, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID", "success": false})
	}

	if err = h.repo.UpdateStatus(c.Context(), id, "active"); err != nil {
		utils.LogError(ctx, "⚠️ Failed to resume survey", err, "survey_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to resume survey", "success": false})
	}

	utils.LogInfo(ctx, "✅ Survey resumed", "survey_id", surveyID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"status":  "active",
		"success": true,
	})
}

func (h *SurveyController) ImportSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ImportSurvey request")

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized import attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	file, err := c.FormFile("survey_file")
	if err != nil {
		utils.LogWarn(ctx, "⚠️ No file uploaded")
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded", "success": false})
	}

	utils.LogInfo(ctx, "Processing survey import", "filename", file.Filename, "size", file.Size)

	fileContent, err := file.Open()
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to read file", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file", "success": false})
	}
	defer fileContent.Close()

	var surveyData models.Survey
	if err := json.NewDecoder(fileContent).Decode(&surveyData); err != nil {
		utils.LogError(ctx, "⚠️ Invalid survey format", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey format", "success": false})
	}

	surveyData.ID = uuid.New()
	surveyData.CreatorID, _ = uuid.Parse(userID)
	surveyData.Status = "draft"

	if err = h.repo.CreateSurvey(c.Context(), &surveyData, []models.Question{}, 0); err != nil {
		utils.LogError(ctx, "⚠️ Failed to import survey", err, "survey_id", surveyData.ID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to import survey", "success": false})
	}

	utils.LogInfo(ctx, "✅ Survey imported successfully", "survey_id", surveyData.ID, "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"survey":  surveyData,
		"message": "Survey imported successfully",
		"success": true,
	})
}

func (h *SurveyController) DuplicateSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	surveyID := c.Params("id")
	utils.LogInfo(ctx, "→ DuplicateSurvey request", "survey_id", surveyID)

	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized duplication attempt")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	surveyUUID, err := uuid.Parse(surveyID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Invalid survey ID format", "id", surveyID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	originalSurvey, err := h.repo.GetByID(c.Context(), surveyUUID)
	if err != nil {
		utils.LogWarn(ctx, "⚠️ Survey not found for duplication", "survey_id", surveyID)
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	newSurveyID := uuid.New()
	newSurvey := *originalSurvey
	newSurvey.ID = newSurveyID
	newSurvey.CreatorID = uuid.MustParse(userID)
	newSurvey.Status = "draft"
	newSurvey.CreatedAt = time.Now()
	newSurvey.UpdatedAt = time.Now()

	utils.LogInfo(ctx, "Duplicating survey", "original_id", surveyID, "new_id", newSurveyID)

	if err := h.repo.CreateSurvey(c.Context(), &newSurvey, []models.Question{}, 0); err != nil {
		utils.LogError(ctx, "⚠️ Failed to duplicate survey", err, "original_id", surveyID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to duplicate survey"})
	}

	utils.LogInfo(ctx, "✅ Survey duplicated successfully", "original_id", surveyID, "new_id", newSurveyID)

	return c.JSON(fiber.Map{
		"ok":            true,
		"original_id":   surveyID,
		"new_survey_id": newSurveyID,
		"user_id":       userID,
		"message":       "Survey duplicated successfully",
	})
}

func (h *SurveyController) GetSurveyTemplates(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetSurveyTemplates request")

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

	utils.LogInfo(ctx, "✅ Templates retrieved", "count", len(templates))

	return c.JSON(fiber.Map{"templates": templates})
}

func (h *SurveyController) SaveSurveyDraft(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	userID := "mock-user-id"
	if c.Locals("user_id") != nil {
		if uid, ok := c.Locals("user_id").(string); ok {
			userID = uid
		}
	}

	utils.LogInfo(ctx, "→ SaveSurveyDraft request", "user_id", userID)

	var req models.SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Failed to parse draft request", err)
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

	if err := h.repo.CreateSurvey(c.Context(), &survey, []models.Question{}, 0); err != nil {
		utils.LogError(ctx, "⚠️ Failed to save draft", err, "draft_id", draftID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save draft"})
	}

	utils.LogInfo(ctx, "✅ Survey draft saved", "draft_id", draftID, "user_id", userID)

	return c.JSON(fiber.Map{
		"ok":       true,
		"draft_id": draftID,
		"user_id":  userID,
		"message":  "Survey draft saved successfully",
	})
}
