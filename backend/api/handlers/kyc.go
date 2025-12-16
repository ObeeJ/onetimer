package handlers

import (
	"context"
	"time"

	"onetimer-backend/config"
	"onetimer-backend/models"
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type KYCHandler struct {
	prembly *services.PremblyService
	db      *pgxpool.Pool
}

func NewKYCHandler(cfg *config.Config) *KYCHandler {
	return &KYCHandler{
		prembly: services.NewPremblyService(cfg.PremblyAPIKey),
	}
}

func (h *KYCHandler) SetDB(db *pgxpool.Pool) {
	h.db = db
}

type KYCRequest struct {
	NIN string `json:"nin" validate:"required,len=11"`
}

func (h *KYCHandler) VerifyKYC(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userIDStr, ok := userIDInterface.(string)
	if !ok {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID type"})
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	var req KYCRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.prembly.VerifyNIN(req.NIN)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Oops! We are unable to verify your NIN. Please check that your NIN is correct and try again. If the problem persists, contact support.",
		})
	}

	now := time.Now()
	kyc := models.KYCVerification{
		ID:          uuid.New(),
		UserID:      userID,
		NIN:         req.NIN,
		Status:      "verified",
		FirstName:   resp.Data.FirstName,
		LastName:    resp.Data.LastName,
		Phone:       resp.Data.Phone,
		DateOfBirth: resp.Data.DateOfBirth,
		Gender:      resp.Data.Gender,
		VerifiedAt:  &now,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Save to database if available
	if h.db != nil {
		query := `
			INSERT INTO kyc_verifications 
			(id, user_id, nin, status, first_name, last_name, phone, date_of_birth, gender, verified_at, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
			ON CONFLICT (user_id) DO UPDATE SET
				nin = EXCLUDED.nin,
				status = EXCLUDED.status,
				first_name = EXCLUDED.first_name,
				last_name = EXCLUDED.last_name,
				phone = EXCLUDED.phone,
				date_of_birth = EXCLUDED.date_of_birth,
				gender = EXCLUDED.gender,
				verified_at = EXCLUDED.verified_at,
				updated_at = EXCLUDED.updated_at
		`
		h.db.Exec(context.Background(), query, kyc.ID, kyc.UserID, kyc.NIN, kyc.Status, kyc.FirstName,
			kyc.LastName, kyc.Phone, kyc.DateOfBirth, kyc.Gender, kyc.VerifiedAt,
			kyc.CreatedAt, kyc.UpdatedAt)

		// Update user verification status
		h.db.Exec(context.Background(), `UPDATE users SET is_verified = true, kyc_status = 'verified' WHERE id = $1`, userID)
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   kyc,
	})
}

func (h *KYCHandler) GetKYCStatus(c *fiber.Ctx) error {
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userIDStr, ok := userIDInterface.(string)
	if !ok {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID type"})
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	return c.JSON(fiber.Map{
		"user_id": userID,
		"status":  "pending",
	})
}
