package controllers

import (
	"onetimer-backend/security"

	"github.com/gofiber/fiber/v2"
)

type LogoutController struct{}

func NewLogoutController() *LogoutController {
	return &LogoutController{}
}

func (h *LogoutController) Logout(c *fiber.Ctx) error {
	// Clear all security cookies
	security.ClearSecureCookie(c, "auth_token")
	security.ClearSecureCookie(c, "csrf_token")

	// Clear any session data from Redis if needed
	// sessionID := c.Locals("session_id")
	// if sessionID != nil {
	//     cache.Delete(c.Context(), "session:"+sessionID.(string))
	// }

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Logged out successfully",
	})
}
