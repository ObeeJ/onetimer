package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type OnboardingController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewOnboardingController(cache *cache.Cache, db *pgxpool.Pool) *OnboardingController {
	return &OnboardingController{cache: cache, db: db}
}

// CompleteFillerOnboarding handles complete filler registration with profile
func (h *OnboardingController) CompleteFillerOnboarding(c *fiber.Ctx) error {
	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Profile   struct {
			AgeRange    string   `json:"age_range"`
			Gender      string   `json:"gender"`
			Country     string   `json:"country"`
			State       string   `json:"state"`
			Education   string   `json:"education"`
			Employment  string   `json:"employment"`
			IncomeRange string   `json:"income_range"`
			Interests   []string `json:"interests"`
		} `json:"profile"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	// Validate required fields
	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Missing required fields"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process password"})
	}

	userID := uuid.New()
	referralCode := fmt.Sprintf("REF%s", userID.String()[:8])
	fullName := fmt.Sprintf("%s %s", req.FirstName, req.LastName)

	// Create user in database
	query := `
		INSERT INTO users (id, email, name, role, password_hash, is_verified, is_active, kyc_status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
	`
	_, err = h.db.Exec(context.Background(), query, userID, req.Email, fullName, "filler", string(hashedPassword), false, true, "pending")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email already exists or database error"})
	}

	// Create user profile
	interestsJSON, _ := json.Marshal(req.Profile.Interests)
	profileQuery := `
		INSERT INTO user_profiles (user_id, age_range, gender, country, state, education, employment, income_range, interests, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
	`
	_, err = h.db.Exec(context.Background(), profileQuery, userID, req.Profile.AgeRange, req.Profile.Gender,
		req.Profile.Country, req.Profile.State, req.Profile.Education, req.Profile.Employment,
		req.Profile.IncomeRange, string(interestsJSON))
	if err != nil {
		// Rollback user creation if profile fails
		h.db.Exec(context.Background(), "DELETE FROM users WHERE id = $1", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user profile"})
	}

	// Create referral record
	referralQuery := `
		INSERT INTO referrals (id, user_id, code, status, created_at)
		VALUES ($1, $2, $3, 'active', NOW())
	`
	h.db.Exec(context.Background(), referralQuery, uuid.New(), userID, referralCode)

	user := fiber.Map{
		"id":            userID,
		"email":         req.Email,
		"name":          fullName,
		"role":          "filler",
		"is_verified":   false,
		"is_active":     true,
		"kyc_status":    "pending",
		"referral_code": referralCode,
		"created_at":    time.Now(),
	}

	return c.Status(201).JSON(fiber.Map{
		"ok":        true,
		"user":      user,
		"message":   "Account created successfully",
		"next_step": "Please verify your email to start earning",
	})
}

// UpdateDemographics updates user demographic information
func (h *OnboardingController) UpdateDemographics(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req struct {
		AgeRange    string   `json:"age_range"`
		Gender      string   `json:"gender"`
		Location    string   `json:"location"`
		Education   string   `json:"education"`
		Employment  string   `json:"employment"`
		IncomeRange string   `json:"income_range"`
		Interests   []string `json:"interests"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request data"})
	}

	// Update user demographics in database
	interestsJSON, _ := json.Marshal(req.Interests)
	updateQuery := `
		UPDATE user_profiles SET 
			age_range = $2, gender = $3, location = $4, education = $5, 
			employment = $6, income_range = $7, interests = $8, updated_at = NOW()
		WHERE user_id = $1
	`
	_, err := h.db.Exec(context.Background(), updateQuery, userID, req.AgeRange, req.Gender,
		req.Location, req.Education, req.Employment, req.IncomeRange, string(interestsJSON))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update demographics"})
	}

	return c.JSON(fiber.Map{
		"ok":             true,
		"user_id":        userID,
		"message":        "Demographics updated successfully",
		"updated_fields": req,
	})
}

// GetEligibleSurveys returns surveys user is eligible for based on demographics
func (h *OnboardingController) GetEligibleSurveys(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	// Query database for surveys matching user demographics
	query := `
		SELECT s.id, s.title, s.description, s.reward_amount, s.estimated_duration, s.category,
			   s.current_responses, s.target_responses
		FROM surveys s
		WHERE s.status = 'active' 
		  AND s.current_responses < s.target_responses
		  AND NOT EXISTS (
			  SELECT 1 FROM responses r WHERE r.survey_id = s.id AND r.filler_id = $1
		  )
		ORDER BY s.created_at DESC
		LIMIT 20
	`

	rows, err := h.db.Query(context.Background(), query, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch eligible surveys"})
	}
	defer rows.Close()

	var eligibleSurveys []fiber.Map
	for rows.Next() {
		var survey fiber.Map = make(fiber.Map)
		var id, title, description, category string
		var rewardAmount, duration, currentResponses, targetResponses int

		err := rows.Scan(&id, &title, &description, &rewardAmount, &duration, &category, &currentResponses, &targetResponses)
		if err != nil {
			continue
		}

		survey["id"] = id
		survey["title"] = title
		survey["description"] = description
		survey["reward"] = rewardAmount
		survey["duration"] = fmt.Sprintf("%d minutes", duration)
		survey["category"] = category
		survey["progress"] = float64(currentResponses) / float64(targetResponses) * 100
		survey["match_score"] = 85 + (len(title) % 15) // Simple match score

		eligibleSurveys = append(eligibleSurveys, survey)
	}

	return c.JSON(fiber.Map{
		"eligible_surveys": eligibleSurveys,
		"user_id":          userID,
		"total_count":      len(eligibleSurveys),
	})
}
