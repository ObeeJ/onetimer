package controllers

import (
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	cache            *cache.Cache
	notificationRepo *repository.NotificationRepository
}

func NewNotificationHandler(cache *cache.Cache, notificationRepo *repository.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{cache: cache, notificationRepo: notificationRepo}
}

func (h *NotificationHandler) GetNotifications(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	notifications, err := h.notificationRepo.GetNotifications(c.Context(), userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get notifications"})
	}

	return c.JSON(fiber.Map{
		"notifications": notifications,
	})
}

func (h *NotificationHandler) UpdateNotifications(c *fiber.Ctx) error {
	_, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req struct {
		NotificationIDs []uuid.UUID `json:"notification_ids"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	for _, id := range req.NotificationIDs {
		err := h.notificationRepo.MarkNotificationRead(c.Context(), id)
		if err != nil {
			// Log error but continue with others
			fmt.Printf("Failed to mark notification %s as read: %v\n", id, err)
		}
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Notifications updated successfully",
	})
}

// MarkAsRead marks a single notification as read
func (h *NotificationHandler) MarkAsRead(c *fiber.Ctx) error {
	_, err := uuid.Parse(c.Locals("user_id").(string))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	notificationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid notification ID"})
	}

	err = h.notificationRepo.MarkNotificationRead(c.Context(), notificationID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark notification as read"})
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Notification marked as read",
	})
}
