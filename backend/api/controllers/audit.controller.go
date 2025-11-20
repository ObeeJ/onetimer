package controllers

import (
	"encoding/csv"
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/repository"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuditController struct {
	cache     *cache.Cache
	auditRepo *repository.AuditRepository
}

func NewAuditController(cache *cache.Cache, auditRepo *repository.AuditRepository) *AuditController {
	return &AuditController{cache: cache, auditRepo: auditRepo}
}

// LogAction creates an audit log entry
func (h *AuditController) LogAction(c *fiber.Ctx) error {
	var req models.AuditLog
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	req.ID = uuid.New()
	req.CreatedAt = time.Now()
	ip := string(c.IP())
	req.IPAddress = &ip
	ua := string(c.Request().Header.UserAgent())
	req.UserAgent = &ua

	if err := h.auditRepo.CreateAuditLog(&req); err != nil {
		// TODO: Send to monitoring system if critical action
		return c.Status(500).JSON(fiber.Map{"error": "Failed to log action"})
	}

	return c.Status(201).JSON(fiber.Map{"ok": true})
}

// GetAuditLogs returns audit logs with filtering
func (h *AuditController) GetAuditLogs(c *fiber.Ctx) error {
	// Query parameters
	actionType := c.Query("type", "")
	userID := c.Query("user_id", "")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	filters := make(map[string]interface{})
	if actionType != "" {
		filters["action"] = actionType
	}
	if userID != "" {
		filters["user_id"] = userID
	}

	logs, total, err := h.auditRepo.GetAuditLogs(limit, offset, filters)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get audit logs"})
	}

	return c.JSON(fiber.Map{
		"logs":   logs,
		"total":  total,
		"limit":  limit,
		"offset": offset,
		"filters": fiber.Map{
			"type":    actionType,
			"user_id": userID,
		},
	})
}

// GetAuditStats returns audit statistics
func (h *AuditController) GetAuditStats(c *fiber.Ctx) error {
	period := c.Query("period", "30d") // 24h, 7d, 30d, 90d

	stats, err := h.auditRepo.GetAuditStats(period)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get audit stats"})
	}

	return c.JSON(stats)
}

// ExportAuditLogs exports audit logs to CSV
func (h *AuditController) ExportAuditLogs(c *fiber.Ctx) error {
	format := c.Query("format", "csv")
	actionType := c.Query("type", "")
	userID := c.Query("user_id", "")

	filters := make(map[string]interface{})
	if actionType != "" {
		filters["action"] = actionType
	}
	if userID != "" {
		filters["user_id"] = userID
	}

	data, err := h.auditRepo.ExportAuditLogs(filters)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to export audit logs"})
	}

	filename := fmt.Sprintf("audit_logs_%s.%s", time.Now().Format("20060102"), format)

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	writer := csv.NewWriter(c)
	err = writer.WriteAll(data)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to write csv"})
	}

	return nil
}

// GetSecurityEvents returns security-related audit events
func (h *AuditController) GetSecurityEvents(c *fiber.Ctx) error {
	severity := c.Query("severity", "all") // low, medium, high, critical

	// Mock security events
	events := []fiber.Map{
		{
			"id":        "sec_001",
			"timestamp": time.Now().AddDate(0, 0, -1),
			"type":      "failed_login",
			"severity":  "medium",
			"source_ip": "203.0.113.1",
			"target":    "admin@suspicious.com",
			"details":   "5 failed login attempts in 10 minutes",
			"status":    "investigating",
		},
		{
			"id":        "sec_002",
			"timestamp": time.Now().AddDate(0, 0, -2),
			"type":      "suspicious_activity",
			"severity":  "high",
			"source_ip": "198.51.100.1",
			"target":    "Multiple user accounts",
			"details":   "Unusual survey completion pattern detected",
			"status":    "resolved",
		},
	}

	return c.JSON(fiber.Map{
		"security_events": events,
		"total":           len(events),
		"severity_filter": severity,
	})
}

// CreateAuditReport generates comprehensive audit report
func (h *AuditController) CreateAuditReport(c *fiber.Ctx) error {
	var req struct {
		StartDate   string   `json:"start_date"`
		EndDate     string   `json:"end_date"`
		ActionTypes []string `json:"action_types"`
		Format      string   `json:"format"` // pdf, csv, json
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	reportID := uuid.New()

	// TODO: Generate comprehensive report
	// TODO: Include charts and statistics
	// TODO: Save report for download

	return c.Status(201).JSON(fiber.Map{
		"ok":             true,
		"report_id":      reportID,
		"status":         "generating",
		"message":        "Audit report generation started",
		"estimated_time": "2-5 minutes",
	})
}
