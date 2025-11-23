package controllers

import (
	"onetimer-backend/cache"

	"github.com/gofiber/fiber/v2"
)

type EarningsExportHandler struct {
	cache *cache.Cache
}

func NewEarningsExportHandler(cache *cache.Cache) *EarningsExportHandler {
	return &EarningsExportHandler{cache: cache}
}

func (h *EarningsExportHandler) ExportEarnings(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string) // TODO: Use for user-specific data

	// Fetch earnings data from database (mock for now)
	csvData := "Date,Amount,Source,Status\n"
	csvData += "2024-01-15,500,Survey Completion,Completed\n"
	csvData += "2024-01-20,300,Referral Bonus,Completed\n"
	csvData += "2024-01-25,750,Survey Completion,Completed\n"

	// Set headers for CSV download
	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment; filename=earnings_export.csv")
	
	return c.SendString(csvData)
}
