package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReferralController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewReferralController(cache *cache.Cache, db *pgxpool.Pool) *ReferralController {
	return &ReferralController{cache: cache, db: db}
}

func (h *ReferralController) GetReferrals(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized referral access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Get user's referral code
	var referralCode string
	err := h.db.QueryRow(ctx, `SELECT COALESCE(referral_code, '') FROM users WHERE id = $1`, userID).Scan(&referralCode)
	if err != nil || referralCode == "" {
		referralCode = userID[:8]
		h.db.Exec(ctx, `UPDATE users SET referral_code = $1 WHERE id = $2`, referralCode, userID)
	}

	if c.Query("list") == "true" {
		rows, err := h.db.Query(ctx, `
			SELECT r.id, u.name, u.email, r.created_at, r.bonus_amount, r.status
			FROM referrals r
			JOIN users u ON r.referred_id = u.id
			WHERE r.referrer_id = $1
			ORDER BY r.created_at DESC
		`, userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch referrals"})
		}
		defer rows.Close()

		referrals := []fiber.Map{}
		for rows.Next() {
			var id, name, email, status string
			var joinedAt time.Time
			var points int
			rows.Scan(&id, &name, &email, &joinedAt, &points, &status)
			referrals = append(referrals, fiber.Map{
				"id":        id,
				"name":      name,
				"email":     email,
				"joined_at": joinedAt.Format(time.RFC3339),
				"points":    points,
				"status":    status,
			})
		}

		utils.LogInfo(ctx, "Retrieved referrals for user", "user_id", userID, "count", len(referrals))
		return c.JSON(fiber.Map{
			"success": true,
			"data":    referrals,
			"count":   len(referrals),
		})
	}

	// Get stats from database
	var totalReferrals, activeReferrals, totalEarnings int
	h.db.QueryRow(ctx, `SELECT COUNT(*) FROM referrals WHERE referrer_id = $1`, userID).Scan(&totalReferrals)
	h.db.QueryRow(ctx, `SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND status = 'active'`, userID).Scan(&activeReferrals)
	h.db.QueryRow(ctx, `SELECT COALESCE(SUM(bonus_amount), 0) FROM referrals WHERE referrer_id = $1 AND bonus_paid = true`, userID).Scan(&totalEarnings)

	link := "https://onetimesurvey.xyz/ref/" + referralCode
	utils.LogInfo(ctx, "Referral info requested for user", "user_id", userID)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"link":             link,
			"code":             referralCode,
			"total_referrals":  totalReferrals,
			"active_referrals": activeReferrals,
			"total_earnings":   totalEarnings,
		},
	})
}

func (h *ReferralController) GenerateCode(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized code generation attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Check if user already has a referral code
	var existingCode string
	err := h.db.QueryRow(ctx, `SELECT COALESCE(referral_code, '') FROM users WHERE id = $1`, userID).Scan(&existingCode)
	if err == nil && existingCode != "" {
		link := "https://onetimesurvey.xyz/ref/" + existingCode
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"code": existingCode,
				"link": link,
			},
			"message": "Referral code already exists",
		})
	}

	// Generate new code
	code := userID[:8]
	link := "https://onetimesurvey.xyz/ref/" + code

	// Save to database
	_, err = h.db.Exec(ctx, `UPDATE users SET referral_code = $1 WHERE id = $2`, code, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate code"})
	}

	utils.LogInfo(ctx, "Generated referral code for user", "user_id", userID, "code", code)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"code": code,
			"link": link,
		},
		"message": "Referral code generated successfully",
	})
}

func (h *ReferralController) GetStats(c *fiber.Ctx) error {
	ctx := context.Background()
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "Unauthorized stats access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Get user's referral code
	var referralCode string
	err := h.db.QueryRow(ctx, `SELECT COALESCE(referral_code, '') FROM users WHERE id = $1`, userID).Scan(&referralCode)
	if err != nil || referralCode == "" {
		// Generate referral code if doesn't exist
		referralCode = userID[:8]
		h.db.Exec(ctx, `UPDATE users SET referral_code = $1 WHERE id = $2`, referralCode, userID)
	}

	// Get referral stats
	var totalReferrals, activeReferrals int
	var totalEarnings, pendingEarnings int

	h.db.QueryRow(ctx, `SELECT COUNT(*) FROM referrals WHERE referrer_id = $1`, userID).Scan(&totalReferrals)
	h.db.QueryRow(ctx, `SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND status = 'active'`, userID).Scan(&activeReferrals)
	h.db.QueryRow(ctx, `SELECT COALESCE(SUM(bonus_amount), 0) FROM referrals WHERE referrer_id = $1 AND bonus_paid = true`, userID).Scan(&totalEarnings)
	h.db.QueryRow(ctx, `SELECT COALESCE(SUM(bonus_amount), 0) FROM referrals WHERE referrer_id = $1 AND bonus_paid = false AND first_survey_completed = true`, userID).Scan(&pendingEarnings)

	// Get referral list
	rows, _ := h.db.Query(ctx, `
		SELECT r.id, u.name, u.email, r.status, r.bonus_amount, r.created_at, r.first_survey_completed
		FROM referrals r
		JOIN users u ON r.referred_id = u.id
		WHERE r.referrer_id = $1
		ORDER BY r.created_at DESC
	`, userID)
	defer rows.Close()

	referrals := []fiber.Map{}
	for rows.Next() {
		var id, name, email, status string
		var bonusAmount int
		var createdAt time.Time
		var firstSurveyCompleted bool
		rows.Scan(&id, &name, &email, &status, &bonusAmount, &createdAt, &firstSurveyCompleted)
		referrals = append(referrals, fiber.Map{
			"id":                     id,
			"name":                   name,
			"email":                  email,
			"status":                 status,
			"earnings":               bonusAmount,
			"join_date":              createdAt,
			"first_survey_completed": firstSurveyCompleted,
		})
	}

	return c.JSON(fiber.Map{
		"total_referrals":  totalReferrals,
		"active_referrals": activeReferrals,
		"total_earnings":   totalEarnings,
		"pending_earnings": pendingEarnings,
		"referral_code":    referralCode,
		"referrals":        referrals,
	})
}

// Track referral - when a user signs up via referral link
func (h *ReferralController) TrackReferral(c *fiber.Ctx) error {
	ctx := context.Background()
	var req struct {
		ReferralCode string `json:"referral_code"`
		NewUserID    string `json:"new_user_id"`
		NewUserEmail string `json:"new_user_email"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Invalid referral tracking request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.ReferralCode == "" || req.NewUserID == "" {
		utils.LogWarn(ctx, "Missing required fields in referral tracking")
		return c.Status(400).JSON(fiber.Map{"error": "Referral code and new user ID are required"})
	}

	// Find referrer by code
	var referrerID string
	err := h.db.QueryRow(ctx, `SELECT id FROM users WHERE referral_code = $1`, req.ReferralCode).Scan(&referrerID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Invalid referral code"})
	}

	// Create referral record
	_, err = h.db.Exec(ctx, `
		INSERT INTO referrals (referrer_id, referred_id, referral_code, status, bonus_amount)
		VALUES ($1, $2, $3, 'pending', 1000)
	`, referrerID, req.NewUserID, req.ReferralCode)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to track referral"})
	}

	// Update referred user
	h.db.Exec(ctx, `UPDATE users SET referred_by = $1 WHERE id = $2`, referrerID, req.NewUserID)

	utils.LogInfo(ctx, "Referral tracked", "referral_code", req.ReferralCode, "new_user", req.NewUserID)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Referral tracked successfully",
		"reward":  1000,
	})
}
