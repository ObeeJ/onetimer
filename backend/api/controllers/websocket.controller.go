package controllers

import (
	"context"
	"onetimer-backend/services"
	"onetimer-backend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type WebSocketController struct {
	hub *services.Hub
}

func NewWebSocketController(hub *services.Hub) *WebSocketController {
	return &WebSocketController{hub: hub}
}

// HandleWebSocket handles WebSocket upgrade and communication
func (wsc *WebSocketController) HandleWebSocket(c *websocket.Conn) {
	ctx := context.Background()
	// Get user ID from query parameter or locals (set by middleware)
	userID := c.Query("user_id")
	if userID == "" {
		// Try to get from locals (if JWT middleware set it)
		if uid := c.Locals("user_id"); uid != nil {
			userID = uid.(string)
		}
	}

	if userID == "" {
		utils.LogWarn(ctx, "⚠️ WebSocket connection attempted without user_id")
		c.Close()
		return
	}

	// Create new client
	client := &services.Client{
		UserID: userID,
		Conn:   c,
		Send:   make(chan services.WSMessage, 256),
	}

	// Register client with hub
	wsc.hub.RegisterClient(client)

	utils.LogInfo(ctx, "✅ WebSocket connection established", "user_id", userID)

	// Send welcome message
	wsc.hub.SendNotification(userID, services.WSMessage{
		Type:    services.WSMsgSystemAlert,
		Title:   "Connected",
		Message: "You are now connected to OneTimer real-time notifications",
	})

	// Start read and write pumps
	go client.WritePump()
	client.ReadPump(wsc.hub)
}

// GetStats returns WebSocket connection statistics (admin only)
func (wsc *WebSocketController) GetStats(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success":           true,
		"total_connections": wsc.hub.GetTotalConnections(),
	})
}
