package controllers

import (
	"context"
	"encoding/json"
	"strings"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SurveyHandler struct {
	cache *cache.Cache
	db    *pgxpool.Pool
	repo  *repository.SurveyRepository
}

func NewSurveyHandler(cache *cache.Cache, db *pgxpool.Pool) *SurveyHandler {
	var repo *repository.SurveyRepository
	if db != nil {
		repo = repository.NewSurveyRepository(db)
	}
	return &SurveyHandler{
		cache: cache,
		db:    db,
		repo:  repo,
	}
}

func (h *SurveyHandler) GetSurveys(c *fiber.Ctx) error {
	if h.db == nil {
		// Fallback mock data
		surveys := []fiber.Map{
			{"ID": "1", "Title": "Consumer Preferences Study", "Description": "Help brands understand your shopping habits.", "Category": "lifestyle", "EstimatedTime": 5, "Reward": 200, "CurrentResponses": 45, "difficulty": "Easy"},
			{"ID": "2", "Title": "Technology Usage Survey", "Description": "Share your tech experience.", "Category": "tech", "EstimatedTime": 7, "Reward": 300, "CurrentResponses": 32, "difficulty": "Medium"},
			{"ID": "3", "Title": "Health & Wellness Survey", "Description": "Tell us about your wellness routines.", "Category": "health", "EstimatedTime": 6, "Reward": 250, "CurrentResponses": 28, "difficulty": "Easy"},
		}
		return c.JSON(fiber.Map{"data": surveys, "success": true})
	}

	// Get surveys from database
	rows, err := h.db.Query(c.Context(), "SELECT id, title, description, category, estimated_time, reward, current_responses FROM surveys WHERE status = 'active' ORDER BY created_at DESC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description, category string
		var estimatedTime, reward, currentResponses int
		rows.Scan(&id, &title, &description, &category, &estimatedTime, &reward, &currentResponses)
		
		surveys = append(surveys, fiber.Map{
			"ID": id,
			"Title": title,
			"Description": description,
			"Category": category,
			"EstimatedTime": estimatedTime,
			"Reward": reward,
			"CurrentResponses": currentResponses,
			"difficulty": "Easy",
		})
	}

	return c.JSON(fiber.Map{"data": surveys, "success": true})
}

func (h *SurveyHandler) GetSurvey(c *fiber.Ctx) error {
	id := c.Params("id")

	if h.db == nil {
		// Mock data
		survey := fiber.Map{
			"Title": "Consumer Preferences Study",
			"Description": "Help brands understand your shopping habits and preferences.",
			"Category": "lifestyle",
			"EstimatedTime": 5,
			"Reward": 200,
			"CurrentResponses": 45,
			"difficulty": "Easy",
		}
		questions := []fiber.Map{
			{"id": "q1", "type": "single", "text": "What is your age group?", "options": []string{"18-25", "26-35", "36-45", "46-55", "55+"}},
			{"id": "q2", "type": "multi", "text": "Which factors influence your purchasing decisions?", "options": []string{"Price", "Quality", "Brand reputation", "Reviews", "Convenience"}},
			{"id": "q3", "type": "text", "text": "Describe your typical shopping experience.", "placeholder": "Share your thoughts..."},
			{"id": "q4", "type": "rating", "text": "Rate your satisfaction with online shopping.", "scale": 5},
		}
		return c.JSON(fiber.Map{"data": fiber.Map{"survey": survey, "questions": questions}, "questions": questions, "reward": 200})
	}

	// Get survey from database
	var title, description, category string
	var estimatedTime, reward, currentResponses int
	err := h.db.QueryRow(c.Context(), "SELECT title, description, category, estimated_time, reward, current_responses FROM surveys WHERE id = $1", id).Scan(&title, &description, &category, &estimatedTime, &reward, &currentResponses)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Survey not found"})
	}

	// Get questions
	rows, err := h.db.Query(c.Context(), "SELECT id, type, text, options FROM questions WHERE survey_id = $1 ORDER BY order_num", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch questions"})
	}
	defer rows.Close()

	var questions []fiber.Map
	for rows.Next() {
		var qid, qtype, qtext, options string
		rows.Scan(&qid, &qtype, &qtext, &options)
		
		q := fiber.Map{"id": qid, "type": qtype, "text": qtext}
		if options != "" {
			if qtype == "rating" {
				q["scale"] = 5
			} else {
				q["options"] = strings.Split(options, ",")
			}
		}
		if qtype == "text" {
			q["placeholder"] = "Share your thoughts..."
		}
		questions = append(questions, q)
	}

	survey := fiber.Map{
		"Title": title,
		"Description": description,
		"Category": category,
		"EstimatedTime": estimatedTime,
		"Reward": reward,
		"CurrentResponses": currentResponses,
		"difficulty": "Easy",
	}

	return c.JSON(fiber.Map{"data": fiber.Map{"survey": survey, "questions": questions}, "questions": questions, "reward": reward})
}

func (h *SurveyHandler) SubmitResponse(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	userID := "user_123" // Mock user ID

	var req struct {
		Responses []map[string]interface{} `json:"responses"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Get reward amount
	reward := 200
	if h.db != nil {
		h.db.QueryRow(c.Context(), "SELECT reward FROM surveys WHERE id = $1", surveyID).Scan(&reward)
		
		// Save response
		answersJSON, _ := json.Marshal(req.Responses)
		h.db.Exec(c.Context(), "INSERT INTO responses (id, survey_id, user_id, answers) VALUES ($1, $2, $3, $4)", 
			uuid.New().String(), surveyID, userID, string(answersJSON))
		
		// Add earning
		h.db.Exec(c.Context(), "INSERT INTO earnings (id, user_id, amount, source) VALUES ($1, $2, $3, $4)",
			uuid.New().String(), userID, reward, "Survey #"+surveyID+" completion")
		
		// Update response count
		h.db.Exec(c.Context(), "UPDATE surveys SET current_responses = current_responses + 1 WHERE id = $1", surveyID)
	}

	return c.JSON(fiber.Map{
		"ok": true,
		"success": true,
		"message": "Survey submitted successfully! Your reward has been added to your account.",
		"survey_id": surveyID,
		"reward": reward,
		"responses_count": len(req.Responses),
	})
}

func (h *SurveyHandler) CreateSurvey(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	var survey models.Survey
	if err := c.BodyParser(&survey); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	survey.ID = uuid.New()
	survey.CreatorID = uuid.MustParse(userID)
	survey.Status = "draft"

	// Save survey to database
	insertQuery := `
		INSERT INTO surveys (id, creator_id, title, description, category, reward_amount, target_responses, estimated_duration, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
	`
	_, err := h.db.Exec(context.Background(), insertQuery, survey.ID, survey.CreatorID, survey.Title, survey.Description, 
		survey.Category, survey.Reward, survey.MaxResponses, survey.EstimatedTime)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create survey"})
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":      true,
		"survey":  survey,
		"message": "Survey created successfully",
	})
}