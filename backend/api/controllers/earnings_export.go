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
	_ = c.Locals("user_id").(string)

	// TODO: Fetch earnings data from database
	// TODO: Generate CSV or other export format
	// TODO: Return the exported file

	return c.Download("path/to/earnings.csv", "earnings.csv")
}
