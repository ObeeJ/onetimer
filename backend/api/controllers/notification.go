package controllers

import (
	"onetimer-backend/cache"

	"github.com/gofiber/fiber/v2"
)

type NotificationHandler struct {
	cache *cache.Cache
}

func NewNotificationHandler(cache *cache.Cache) *NotificationHandler {
	return &NotificationHandler{cache: cache}
}

func (h *NotificationHandler) GetNotifications(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

	// TODO: Get notifications from database

	return c.JSON(fiber.Map{
		"notifications": []string{"Notification 1", "Notification 2"},
	})
}

func (h *NotificationHandler) UpdateNotifications(c *fiber.Ctx) error {
	_ = c.Locals("user_id").(string)

	var req struct {
		Notifications []string `json:"notifications"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Update notifications in database

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Notifications updated successfully",
	})
}
