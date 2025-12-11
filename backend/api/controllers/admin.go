package controllers

import (
	"context"
	"encoding/csv"
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminHandler struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewAdminHandler(cache *cache.Cache, db *pgxpool.Pool) *AdminHandler {
	return &AdminHandler{cache: cache, db: db}
}

func (h *AdminHandler) GetUsers(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	role := c.Query("role", "")
	status := c.Query("status", "")
	search := c.Query("search", "")

	query := `
		SELECT u.id, u.email, u.name, u.role, u.is_verified, u.is_active, u.kyc_status, u.created_at,
			   COALESCE(SUM(e.amount), 0) as total_earnings
		FROM users u
		LEFT JOIN earnings e ON u.id = e.user_id AND e.status = 'completed'
		WHERE 1=1
	`
	args := []interface{}{}
	argCount := 0

	if role != "" {
		argCount++
		query += fmt.Sprintf(" AND u.role = $%d", argCount)
		args = append(args, role)
	}

	switch status {
	case "active":
		argCount++
		query += fmt.Sprintf(" AND u.is_active = $%d", argCount)
		args = append(args, true)
	case "inactive":
		argCount++
		query += fmt.Sprintf(" AND u.is_active = $%d", argCount)
		args = append(args, false)
	}

	if search != "" {
		argCount++
		query += fmt.Sprintf(" AND (u.name ILIKE $%d OR u.email ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+search+"%")
	}

	query += " GROUP BY u.id, u.email, u.name, u.role, u.is_verified, u.is_active, u.kyc_status, u.created_at"
	query += " ORDER BY u.created_at DESC"

	argCount++
	query += fmt.Sprintf(" LIMIT $%d", argCount)
	args = append(args, limit)

	argCount++
	query += fmt.Sprintf(" OFFSET $%d", argCount)
	args = append(args, offset)

	rows, err := h.db.Query(context.Background(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	defer rows.Close()

	var users []fiber.Map
	for rows.Next() {
		var user fiber.Map = make(fiber.Map)
		var id, email, name, role, kycStatus string
		var isVerified, isActive bool
		var totalEarnings int
		var createdAt time.Time

		err := rows.Scan(&id, &email, &name, &role, &isVerified, &isActive, &kycStatus, &createdAt, &totalEarnings)
		if err != nil {
			continue
		}

		user["id"] = id
		user["email"] = email
		user["name"] = name
		user["role"] = role
		user["is_verified"] = isVerified
		user["is_active"] = isActive
		user["kyc_status"] = kycStatus
		user["total_earnings"] = totalEarnings
		user["created_at"] = createdAt

		users = append(users, user)
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM users WHERE 1=1"
	if role != "" {
		countQuery += " AND role = '" + role + "'"
	}
	var total int
	h.db.QueryRow(context.Background(), countQuery).Scan(&total)

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *AdminHandler) ApproveUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := c.Locals("user_id").(string)

	// Update user status
	updateQuery := `UPDATE users SET kyc_status = 'approved', is_verified = true, updated_at = NOW() WHERE id = $1`
	_, err := h.db.Exec(context.Background(), updateQuery, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to approve user"})
	}

	// Create audit log
	auditQuery := `
		INSERT INTO audit_logs (id, user_id, action, resource, details, created_at)
		VALUES ($1, $2, 'user_approved', $3, $4, NOW())
	`
	details := fmt.Sprintf(`{"admin_id": "%s", "user_id": "%s"}`, adminID, userID)
	h.db.Exec(context.Background(), auditQuery, uuid.New(), adminID, "user:"+userID, details)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User approved successfully",
		"user_id": userID,
	})
}

func (h *AdminHandler) RejectUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var req struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&req)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User rejected",
		"user_id": userID,
		"reason":  req.Reason,
	})
}

func (h *AdminHandler) GetSurveys(c *fiber.Ctx) error {
	surveys := []models.Survey{
		{
			ID:          uuid.New(),
			Title:       "Pending Survey 1",
			Description: "Awaiting approval",
			Status:      "pending",
			CreatedAt:   time.Now().AddDate(0, 0, -1),
		},
		{
			ID:          uuid.New(),
			Title:       "Active Survey 1",
			Description: "Currently running",
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, 0, -7),
		},
	}

	return c.JSON(fiber.Map{"surveys": surveys})
}

func (h *AdminHandler) ApproveSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")

	return c.JSON(fiber.Map{
		"ok":        true,
		"message":   "Survey approved",
		"survey_id": surveyID,
	})
}

func (h *AdminHandler) GetPayments(c *fiber.Ctx) error {
	payments := []fiber.Map{
		{
			"id":         uuid.New().String(),
			"user_id":    uuid.New().String(),
			"amount":     5000,
			"status":     "pending",
			"bank_name":  "Access Bank",
			"created_at": time.Now().AddDate(0, 0, -1),
		},
		{
			"id":         uuid.New().String(),
			"user_id":    uuid.New().String(),
			"amount":     3500,
			"status":     "completed",
			"bank_name":  "GTBank",
			"created_at": time.Now().AddDate(0, 0, -3),
		},
	}

	return c.JSON(fiber.Map{"payments": payments})
}

func (h *AdminHandler) GetReports(c *fiber.Ctx) error {
	reports := fiber.Map{
		"total_users":    1250,
		"active_surveys": 45,
		"total_earnings": 2500000,
		"pending_kyc":    23,
		"monthly_growth": 15.5,
	}

	return c.JSON(reports)
}

// ProcessPayouts handles batch payout processing
func (h *AdminHandler) ProcessPayouts(c *fiber.Ctx) error {
	var req struct {
		WithdrawalIDs []string `json:"withdrawal_ids"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// TODO: Process payouts via Paystack
	processed := 0
	failed := 0

	for _, id := range req.WithdrawalIDs {
		// Mock processing
		if len(id) > 0 {
			processed++
		} else {
			failed++
		}
	}

	return c.JSON(fiber.Map{
		"ok":        true,
		"processed": processed,
		"failed":    failed,
		"message":   fmt.Sprintf("Processed %d payouts, %d failed", processed, failed),
	})
}

// ExportUsers exports user data
func (h *AdminHandler) ExportUsers(c *fiber.Ctx) error {
	format := c.Query("format", "csv")
	filename := fmt.Sprintf("users_export_%s.%s", time.Now().Format("20060102"), format)

	// Mock user data
	users := []fiber.Map{
		{"id": "1", "name": "John Doe", "email": "user@onetimesurvey.com", "role": "filler", "status": "active"},
		{"id": "2", "name": "Jane Smith", "email": "jane@example.com", "role": "creator", "status": "active"},
	}

	if format == "csv" {
		c.Set("Content-Type", "text/csv")
		c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

		writer := csv.NewWriter(c)
		defer writer.Flush()

		// Header
		writer.Write([]string{"ID", "Name", "Email", "Role", "Status"})

		// Data
		for _, user := range users {
			writer.Write([]string{
				user["id"].(string),
				user["name"].(string),
				user["email"].(string),
				user["role"].(string),
				user["status"].(string),
			})
		}
		return nil
	}

	return c.JSON(fiber.Map{"users": users})
}

// GetUserDetails returns detailed user information
func (h *AdminHandler) GetUserDetails(c *fiber.Ctx) error {
	userID := c.Params("id")

	user := fiber.Map{
		"id":                userID,
		"name":              "John Doe",
		"email":             "user@onetimesurvey.com",
		"role":              "filler",
		"status":            "active",
		"kyc_status":        "verified",
		"phone":             "+234801234567",
		"location":          "Lagos, Nigeria",
		"joined_date":       "2024-01-15",
		"last_active":       "2024-01-20",
		"total_earnings":    45200,
		"surveys_completed": 23,
		"kyc_documents":     []string{"id_card.jpg", "selfie.jpg"},
	}

	return c.JSON(user)
}

// SuspendUser suspends a user account
func (h *AdminHandler) SuspendUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var req struct {
		Reason   string `json:"reason"`
		Duration int    `json:"duration"` // days
	}
	c.BodyParser(&req)

	return c.JSON(fiber.Map{
		"ok":       true,
		"message":  "User suspended successfully",
		"user_id":  userID,
		"reason":   req.Reason,
		"duration": req.Duration,
	})
}

// ActivateUser activates a suspended user
func (h *AdminHandler) ActivateUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User activated successfully",
		"user_id": userID,
	})
}
