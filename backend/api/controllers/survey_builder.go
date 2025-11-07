package controllers

import (
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SurveyBuilderController struct {
	cache *cache.Cache
}

func NewSurveyBuilderController(cache *cache.Cache) *SurveyBuilderController {
	return &SurveyBuilderController{cache: cache}
}

type Question struct {
	ID          string   `json:"id"`
	Type        string   `json:"type"` // single, multi, text, rating, matrix
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Required    bool     `json:"required"`
	Options     []string `json:"options,omitempty"`
	Scale       int      `json:"scale,omitempty"` // for rating questions
	Rows        []string `json:"rows,omitempty"`  // for matrix questions
	Cols        []string `json:"cols,omitempty"`  // for matrix questions
	Order       int      `json:"order"`
}

type SurveyRequest struct {
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Category     string     `json:"category"`
	RewardAmount int        `json:"reward_amount"`
	TargetCount  int        `json:"target_count"`
	Duration     int        `json:"estimated_duration"`
	Questions    []Question `json:"questions"`
	Demographics struct {
		AgeGroups    []string `json:"age_groups,omitempty"`
		Genders      []string `json:"genders,omitempty"`
		Locations    []string `json:"locations,omitempty"`
		Education    []string `json:"education,omitempty"`
		Employment   []string `json:"employment,omitempty"`
		IncomeRanges []string `json:"income_ranges,omitempty"`
	} `json:"demographics,omitempty"`
}

// CreateSurvey creates a new survey with questions
func (h *SurveyBuilderController) CreateSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	// Validate survey data
	if req.Title == "" || req.Description == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Title and description are required"})
	}

	if len(req.Questions) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one question is required"})
	}

	if req.RewardAmount < 200 || req.RewardAmount > 5000 {
		return c.Status(400).JSON(fiber.Map{"error": "Reward amount must be between ₦200 and ₦5,000"})
	}

	// TODO: Check creator has enough credits
	totalCost := req.TargetCount * 1 // 1 credit per response

	surveyID := uuid.New()

	// TODO: Save survey and questions to database
	// TODO: Deduct credits from creator
	// TODO: Set survey status based on auto-approval settings

	survey := fiber.Map{
		"id":                 surveyID,
		"creator_id":         userID,
		"title":              req.Title,
		"description":        req.Description,
		"category":           req.Category,
		"reward_amount":      req.RewardAmount,
		"target_responses":   req.TargetCount,
		"current_responses":  0,
		"estimated_duration": req.Duration,
		"status":             "pending", // pending, active, paused, completed
		"questions":          req.Questions,
		"demographics":       req.Demographics,
		"total_cost":         totalCost,
		"created_at":         time.Now(),
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":      true,
		"survey":  survey,
		"message": "Survey created successfully and submitted for review",
	})
}

// UpdateSurvey updates an existing survey
func (h *SurveyBuilderController) UpdateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	var req SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	// TODO: Verify survey belongs to user
	// TODO: Check if survey can be edited (not active)
	// TODO: Update survey in database

	return c.JSON(fiber.Map{
		"ok":        true,
		"survey_id": surveyID,
		"user_id":   userID,
		"message":   "Survey updated successfully",
	})
}

// DuplicateSurvey creates a copy of an existing survey
func (h *SurveyBuilderController) DuplicateSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := c.Locals("user_id").(string)

	// TODO: Get original survey from database
	// TODO: Create new survey with same content

	newSurveyID := uuid.New()

	return c.Status(201).JSON(fiber.Map{
		"ok":            true,
		"original_id":   surveyID,
		"new_survey_id": newSurveyID,
		"user_id":       userID,
		"message":       "Survey duplicated successfully",
	})
}

// ImportSurvey imports survey from JSON/CSV file
func (h *SurveyBuilderController) ImportSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	file, err := c.FormFile("survey_file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// TODO: Parse uploaded file (JSON/CSV)
	// TODO: Validate survey structure
	// TODO: Create survey from imported data

	return c.Status(201).JSON(fiber.Map{
		"ok":       true,
		"user_id":  userID,
		"message":  "Survey imported successfully",
		"filename": file.Filename,
	})
}

// GetSurveyTemplates returns pre-built survey templates
func (h *SurveyBuilderController) GetSurveyTemplates(c *fiber.Ctx) error {
	templates := []fiber.Map{
		{
			"id":          "template_001",
			"name":        "Customer Satisfaction Survey",
			"description": "Measure customer satisfaction and feedback",
			"category":    "business",
			"questions":   5,
			"preview": []Question{
				{
					ID:       "q1",
					Type:     "rating",
					Title:    "How satisfied are you with our service?",
					Required: true,
					Scale:    5,
					Order:    1,
				},
				{
					ID:       "q2",
					Type:     "text",
					Title:    "What can we improve?",
					Required: false,
					Order:    2,
				},
			},
		},
		{
			"id":          "template_002",
			"name":        "Market Research Survey",
			"description": "Understand market trends and preferences",
			"category":    "research",
			"questions":   8,
			"preview": []Question{
				{
					ID:       "q1",
					Type:     "single",
					Title:    "What is your age group?",
					Required: true,
					Options:  []string{"18-25", "26-35", "36-45", "46-55", "55+"},
					Order:    1,
				},
			},
		},
	}

	return c.JSON(fiber.Map{"templates": templates})
}

// SaveSurveyDraft saves survey as draft
func (h *SurveyBuilderController) SaveSurveyDraft(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req SurveyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey data"})
	}

	draftID := uuid.New()

	// TODO: Save as draft in database

	return c.JSON(fiber.Map{
		"ok":       true,
		"draft_id": draftID,
		"user_id":  userID,
		"message":  "Survey draft saved successfully",
	})
}
