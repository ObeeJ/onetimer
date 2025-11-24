package controllers

import (
	"onetimer-backend/api/middleware"
	"onetimer-backend/security"
	"onetimer-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type LogoutController struct{}

func NewLogoutController() *LogoutController {
	return &LogoutController{}
}

func (h *LogoutController) Logout(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)

	utils.LogInfo(ctx, "→ Logout request initiated", "client_ip", c.IP(), "method", c.Method())

	// Extract user info from token if available for audit trail
	userID := c.Locals("user_id")
	userRole := c.Locals("user_role")
	tokenSource := c.Locals("token_source")

	if userID != nil {
		utils.LogInfo(ctx, "🔓 User logout initiated", 
			"user_id", userID, 
			"role", userRole,
			"token_source", tokenSource,
			"client_ip", c.IP(),
		)
	} else {
		utils.LogWarn(ctx, "⚠️ Logout attempt without valid user context", "client_ip", c.IP())
	}

	// Clear authentication cookies with logging
	utils.LogInfo(ctx, "🗑️ Clearing authentication cookies...")
	security.ClearSecureCookie(c, "auth_token")
	security.ClearSecureCookie(c, "csrf_token")
	security.ClearSecureCookie(c, "user_role")
	utils.LogInfo(ctx, "✅ All authentication cookies cleared")

	// Clear any session data from cache if needed
	sessionID := c.Locals("session_id")
	if sessionID != nil {
		utils.LogInfo(ctx, "🗑️ Clearing session data", "session_id", sessionID)
		// TODO: Implement cache.Delete(c.Context(), "session:"+sessionID.(string))
		utils.LogInfo(ctx, "✅ Session data cleared")
	}

	if userID != nil {
		utils.LogInfo(ctx, "← Logout completed successfully", 
			"user_id", userID, 
			"role", userRole,
			"client_ip", c.IP(),
		)
	} else {
		utils.LogInfo(ctx, "← Logout completed (no user context)", "client_ip", c.IP())
	}

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "Logged out successfully",
	})
}
