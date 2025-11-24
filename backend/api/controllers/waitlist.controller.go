package controllers

import (
	"context"
	"errors"
	"onetimer-backend/services"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WaitlistController struct {
	db           *pgxpool.Pool
	emailService *services.EmailService
}

func NewWaitlistController(db *pgxpool.Pool, emailService *services.EmailService) *WaitlistController {
	return &WaitlistController{
		db:           db,
		emailService: emailService,
	}
}

type WaitlistEntry struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	Source    string    `json:"source"`
}

// JoinWaitlist handles email submission from landing page
func (h *WaitlistController) JoinWaitlist(c *fiber.Ctx) error {
	ctx := context.Background()

	var req struct {
		Email  string `json:"email"`
		Source string `json:"source"` // e.g., "landing_page", "hero_section"
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Invalid waitlist request", err)
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request data",
		})
	}

	// Validate email
	if req.Email == "" || !isValidEmail(req.Email) {
		utils.LogWarn(ctx, "⚠️ Invalid email provided to waitlist", "email", req.Email)
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Please provide a valid email address",
		})
	}

	// Set default source
	if req.Source == "" {
		req.Source = "hero_section"
	}

	// Check if email already exists
	var existingEmail string
	err := h.db.QueryRow(ctx, "SELECT email FROM waitlist WHERE email = $1", req.Email).Scan(&existingEmail)
	if err == nil {
		utils.LogInfo(ctx, "→ Email already on waitlist", "email", req.Email)
		return c.JSON(fiber.Map{
			"success": true,
			"message": "You're already on our waitlist! We'll notify you soon.",
			"status":  "already_subscribed",
		})
	}

	// Create waitlist entry
	entryID := uuid.New()
	_, err = h.db.Exec(ctx,
		`INSERT INTO waitlist (id, email, source, created_at)
		 VALUES ($1, $2, $3, $4)`,
		entryID, req.Email, req.Source, time.Now())

	if err != nil {
		// Check for PostgreSQL unique constraint violation (SQLSTATE 23505)
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.SQLState() == "23505" {
			utils.LogWarn(ctx, "⚠️ Waitlist - email already exists", "email", req.Email, "constraint", pgErr.ConstraintName)
			return c.Status(409).JSON(fiber.Map{
				"success": true,
				"message": "You're already on our waitlist! We'll notify you soon.",
				"status":  "already_subscribed",
			})
		}
		utils.LogError(ctx, "⚠️ Failed to save waitlist entry", err, "email", req.Email)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Something went wrong. Please try again in a moment.",
		})
	}

	utils.LogInfo(ctx, "✅ New waitlist entry", "email", req.Email, "source", req.Source)

	// Send welcome email asynchronously (don't block response)
	go func() {
		bgCtx := context.Background()
		if err := h.emailService.SendWaitlistConfirmation(req.Email); err != nil {
			utils.LogError(bgCtx, "⚠️ Failed to send waitlist confirmation email", err, "email", req.Email)
		}
	}()

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "🎉 You're on the waitlist! We'll notify you when we launch.",
		"email":   req.Email,
	})
}

// GetWaitlistStats returns waitlist statistics (admin only)
func (h *WaitlistController) GetWaitlistStats(c *fiber.Ctx) error {
	ctx := context.Background()

	var total int
	err := h.db.QueryRow(ctx, "SELECT COUNT(*) FROM waitlist").Scan(&total)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to get waitlist stats", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch stats"})
	}

	// Get today's count
	var todayCount int
	h.db.QueryRow(ctx,
		"SELECT COUNT(*) FROM waitlist WHERE created_at >= CURRENT_DATE").Scan(&todayCount)

	utils.LogInfo(ctx, "✅ Waitlist stats requested", "total", total, "today", todayCount)

	return c.JSON(fiber.Map{
		"success":     true,
		"total":       total,
		"today":       todayCount,
		"growth_rate": calculateGrowthRate(total, todayCount),
	})
}

// Helper functions
func isValidEmail(email string) bool {
	// Basic email validation
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	// Simple regex-like check for @ and .
	hasAt := false
	hasDot := false
	for i, ch := range email {
		if ch == '@' {
			if hasAt || i == 0 || i == len(email)-1 {
				return false
			}
			hasAt = true
		}
		if ch == '.' && hasAt {
			hasDot = true
		}
	}
	return hasAt && hasDot
}

func calculateGrowthRate(total, today int) float64 {
	if total == 0 {
		return 0
	}
	return (float64(today) / float64(total)) * 100
}
