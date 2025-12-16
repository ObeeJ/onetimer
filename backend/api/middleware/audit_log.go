package middleware

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuditLogger struct {
	db *pgxpool.Pool
}

func NewAuditLogger(db *pgxpool.Pool) *AuditLogger {
	return &AuditLogger{db: db}
}

// AuditLog middleware for admin/super-admin actions
func (a *AuditLogger) LogAdminAction() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Capture request details
		startTime := time.Now()
		userID := c.Locals("user_id")
		role := c.Locals("role")

		// Process request
		err := c.Next()

		// Log after request completes
		go a.logAction(c, userID, role, startTime, err)

		return err
	}
}

func (a *AuditLogger) logAction(c *fiber.Ctx, userID, role interface{}, startTime time.Time, err error) {
	if a.db == nil {
		return
	}

	// Prepare audit log entry
	logEntry := map[string]interface{}{
		"id":          uuid.New().String(),
		"user_id":     userID,
		"role":        role,
		"action":      c.Method() + " " + c.Path(),
		"ip_address":  c.IP(),
		"user_agent":  c.Get("User-Agent"),
		"status_code": c.Response().StatusCode(),
		"duration_ms": time.Since(startTime).Milliseconds(),
		"timestamp":   time.Now(),
	}

	// Add request body for sensitive operations (excluding passwords)
	if c.Method() == "POST" || c.Method() == "PUT" || c.Method() == "DELETE" {
		var body map[string]interface{}
		json.Unmarshal(c.Body(), &body)
		
		// Remove sensitive fields
		delete(body, "password")
		delete(body, "token")
		delete(body, "secret")
		
		logEntry["request_body"] = body
	}

	if err != nil {
		logEntry["error"] = err.Error()
	}

	// Insert into audit_logs table
	query := `
		INSERT INTO audit_logs 
		(id, user_id, role, action, ip_address, user_agent, status_code, duration_ms, request_body, error, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	bodyJSON, _ := json.Marshal(logEntry["request_body"])
	
	a.db.Exec(context.Background(), query,
		logEntry["id"],
		logEntry["user_id"],
		logEntry["role"],
		logEntry["action"],
		logEntry["ip_address"],
		logEntry["user_agent"],
		logEntry["status_code"],
		logEntry["duration_ms"],
		string(bodyJSON),
		logEntry["error"],
		logEntry["timestamp"],
	)
}

// Create audit_logs table migration
const AuditLogsMigration = `
CREATE TABLE IF NOT EXISTS audit_logs (
	id UUID PRIMARY KEY,
	user_id UUID,
	role VARCHAR(50),
	action VARCHAR(255) NOT NULL,
	ip_address VARCHAR(45),
	user_agent TEXT,
	status_code INTEGER,
	duration_ms BIGINT,
	request_body JSONB,
	error TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	INDEX idx_user_id (user_id),
	INDEX idx_created_at (created_at),
	INDEX idx_action (action)
);
`
