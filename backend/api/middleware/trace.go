package middleware

import (
	"context"
	"fmt"
	"onetimer-backend/utils"
	"time"

	"github.com/google/uuid"
	"github.com/gofiber/fiber/v2"
)

// TraceMiddleware adds a unique trace_id to every request and logs request/response
func TraceMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Generate unique trace ID
		traceID := fmt.Sprintf("req-%s", uuid.New().String()[:8])

		// Add trace ID to context
		ctx := context.WithValue(c.Context(), "trace_id", traceID)
		c.Locals("trace_id", traceID)

		// Extract user info if available
		userID := c.Locals("user_id")
		if userID != nil {
			ctx = context.WithValue(ctx, "user_id", userID)
		}

		// Log request entry
		startTime := time.Now()
		utils.LogInfoSimple(
			"→ REQUEST",
			"trace_id", traceID,
			"method", c.Method(),
			"path", c.Path(),
			"ip", c.IP(),
			"user_agent", c.Get("User-Agent"),
		)

		// Store context for use in handlers
		c.SetUserContext(ctx)

		// Continue to next handler
		err := c.Next()

		// Log request exit with response details
		duration := time.Since(startTime).Milliseconds()
		utils.LogInfoSimple(
			"← RESPONSE",
			"trace_id", traceID,
			"method", c.Method(),
			"path", c.Path(),
			"status", c.Response().StatusCode(),
			"duration_ms", duration,
		)

		return err
	}
}

// GetTraceID extracts trace_id from Fiber context
func GetTraceID(c *fiber.Ctx) string {
	if traceID, ok := c.Locals("trace_id").(string); ok {
		return traceID
	}
	return "unknown"
}

// GetContextWithTrace creates a context with trace_id from Fiber request
func GetContextWithTrace(c *fiber.Ctx) context.Context {
	// Get or create context for this request
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	// Add trace_id from Fiber Locals
	if traceID, ok := c.Locals("trace_id").(string); ok {
		ctx = context.WithValue(ctx, "trace_id", traceID)
	}

	// Add user_id from Fiber Locals
	if userID, ok := c.Locals("user_id").(string); ok {
		ctx = context.WithValue(ctx, "user_id", userID)
	}

	return ctx
}
