package security

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuditLog struct {
	ID           uuid.UUID              `json:"id"`
	UserID       *uuid.UUID             `json:"user_id,omitempty"`
	Action       string                 `json:"action"`
	ResourceType string                 `json:"resource_type"`
	ResourceID   *uuid.UUID             `json:"resource_id,omitempty"`
	IPAddress    string                 `json:"ip_address"`
	UserAgent    string                 `json:"user_agent"`
	Details      map[string]interface{} `json:"details"`
	CreatedAt    time.Time              `json:"created_at"`
}

type AuditLogger struct {
	// In production, this would write to database
}

func NewAuditLogger() *AuditLogger {
	return &AuditLogger{}
}

func (a *AuditLogger) LogAction(c *fiber.Ctx, action, resourceType string, resourceID *uuid.UUID, details map[string]interface{}) {
	auditLog := AuditLog{
		ID:           uuid.New(),
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		IPAddress:    c.IP(),
		UserAgent:    c.Get("User-Agent"),
		Details:      details,
		CreatedAt:    time.Now(),
	}

	// Get user ID from context if available
	if userID := c.Locals("user_id"); userID != nil {
		if uid, err := uuid.Parse(userID.(string)); err == nil {
			auditLog.UserID = &uid
		}
	}

	// In production, save to database
	// For now, log to console
	logData, _ := json.Marshal(auditLog)
	log.Printf("AUDIT: %s", string(logData))
}

// Middleware for automatic audit logging
func AuditMiddleware() fiber.Handler {
	logger := NewAuditLogger()

	return func(c *fiber.Ctx) error {
		// Skip GET requests for performance
		if c.Method() == "GET" {
			return c.Next()
		}

		// Log the action after processing
		err := c.Next()

		// Determine action based on method and path
		action := getActionFromRequest(c)
		resourceType := getResourceTypeFromPath(c.Path())

		details := map[string]interface{}{
			"method": c.Method(),
			"path":   c.Path(),
			"status": c.Response().StatusCode(),
		}

		logger.LogAction(c, action, resourceType, nil, details)

		return err
	}
}

func getActionFromRequest(c *fiber.Ctx) string {
	method := c.Method()
	path := c.Path()

	switch method {
	case "POST":
		if contains(path, "login") || contains(path, "auth") {
			return "login_attempt"
		}
		if contains(path, "register") {
			return "user_registration"
		}
		return "create"
	case "PUT", "PATCH":
		return "update"
	case "DELETE":
		return "delete"
	default:
		return "unknown"
	}
}

func getResourceTypeFromPath(path string) string {
	if contains(path, "users") {
		return "user"
	}
	if contains(path, "surveys") {
		return "survey"
	}
	if contains(path, "payments") {
		return "payment"
	}
	return "unknown"
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		(len(s) > len(substr) && (s[:len(substr)] == substr || s[len(s)-len(substr):] == substr)))
}
