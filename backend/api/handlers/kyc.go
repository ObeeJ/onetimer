package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"onetimer-backend/config"
	"onetimer-backend/models"
	"onetimer-backend/services"
)

type KYCHandler struct {
	prembly *services.PremblyService
}

func NewKYCHandler(cfg *config.Config) *KYCHandler {
	return &KYCHandler{
		prembly: services.NewPremblyService(cfg.PremblyAPIKey),
	}
}

type KYCRequest struct {
	NIN string `json:"nin" validate:"required,len=11"`
}

func (h *KYCHandler) VerifyKYC(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req KYCRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.prembly.VerifyNIN(req.NIN)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "NIN verification failed"})
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

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   kyc,
	})
}

func (h *KYCHandler) GetKYCStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	return c.JSON(fiber.Map{
		"user_id": userID,
		"status":  "pending",
	})
}
