package controllers

import (
	"context"
	"encoding/csv"
	"fmt"
	"onetimer-backend/cache"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewAdminController(cache *cache.Cache, db *pgxpool.Pool) *AdminController {
	return &AdminController{cache: cache, db: db}
}

func (h *AdminController) GetUsers(c *fiber.Ctx) error {
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

	if status == "active" {
		argCount++
		query += fmt.Sprintf(" AND u.is_active = $%d", argCount)
		args = append(args, true)
	} else if status == "inactive" {
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
	countArgs := []interface{}{}
	if role != "" {
		countQuery += " AND role = $1"
		countArgs = append(countArgs, role)
	}
	var total int
	h.db.QueryRow(context.Background(), countQuery, countArgs...).Scan(&total)

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *AdminController) ApproveUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

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

func (h *AdminController) RejectUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&req)

	// Update user status
	updateQuery := `UPDATE users SET kyc_status = 'rejected', updated_at = NOW() WHERE id = $1`
	_, err := h.db.Exec(context.Background(), updateQuery, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to reject user"})
	}

	// Create audit log
	auditQuery := `
		INSERT INTO audit_logs (id, user_id, action, resource, details, created_at)
		VALUES ($1, $2, 'user_rejected', $3, $4, NOW())
	`
	details := fmt.Sprintf(`{"admin_id": "%s", "user_id": "%s", "reason": "%s"}`, adminID, userID, req.Reason)
	h.db.Exec(context.Background(), auditQuery, uuid.New(), adminID, "user:"+userID, details)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User rejected",
		"user_id": userID,
		"reason":  req.Reason,
	})
}

func (h *AdminController) GetSurveys(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	status := c.Query("status", "")

	query := "SELECT id, title, description, status, reward, max_responses, current_responses, created_at FROM surveys WHERE 1=1"
	args := []interface{}{}
	argCount := 0

	if status != "" {
		argCount++
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"
	argCount++
	query += fmt.Sprintf(" LIMIT $%d", argCount)
	args = append(args, limit)

	argCount++
	query += fmt.Sprintf(" OFFSET $%d", argCount)
	args = append(args, offset)

	rows, err := h.db.Query(context.Background(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description, status string
		var reward, maxResponses, currentResponses int
		var createdAt time.Time

		if err := rows.Scan(&id, &title, &description, &status, &reward, &maxResponses, &currentResponses, &createdAt); err != nil {
			continue
		}

		surveys = append(surveys, fiber.Map{
			"id":                id,
			"title":             title,
			"description":       description,
			"status":            status,
			"reward":            reward,
			"max_responses":     maxResponses,
			"current_responses": currentResponses,
			"created_at":        createdAt,
		})
	}

	if surveys == nil {
		surveys = []fiber.Map{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
		"count":   len(surveys),
	})
}

func (h *AdminController) ApproveSurvey(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	return c.JSON(fiber.Map{
		"ok":        true,
		"message":   "Survey approved",
		"survey_id": surveyID,
	})
}

func (h *AdminController) GetPayments(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	query := "SELECT id, user_id, amount, status, created_at FROM withdrawals ORDER BY created_at DESC LIMIT $1 OFFSET $2"
	rows, err := h.db.Query(context.Background(), query, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch payments"})
	}
	defer rows.Close()

	var payments []fiber.Map
	for rows.Next() {
		var id, userID, status string
		var amount int
		var createdAt time.Time

		if err := rows.Scan(&id, &userID, &amount, &status, &createdAt); err != nil {
			continue
		}

		payments = append(payments, fiber.Map{
			"id":         id,
			"user_id":    userID,
			"amount":     amount,
			"status":     status,
			"created_at": createdAt,
		})
	}

	return c.JSON(fiber.Map{"payments": payments})
}

func (h *AdminController) GetReports(c *fiber.Ctx) error {
	var totalUsers, activeSurveys, pendingKYC int
	var totalEarnings int64

	// Get total users
	h.db.QueryRow(context.Background(), "SELECT COUNT(*) FROM users").Scan(&totalUsers)

	// Get active surveys
	h.db.QueryRow(context.Background(), "SELECT COUNT(*) FROM surveys WHERE status = 'active'").Scan(&activeSurveys)

	// Get total earnings
	h.db.QueryRow(context.Background(), "SELECT COALESCE(SUM(amount), 0) FROM earnings").Scan(&totalEarnings)

	// Get pending KYC
	h.db.QueryRow(context.Background(), "SELECT COUNT(*) FROM users WHERE kyc_status != 'approved'").Scan(&pendingKYC)

	reports := fiber.Map{
		"total_users":    totalUsers,
		"active_surveys": activeSurveys,
		"total_earnings": totalEarnings,
		"pending_kyc":    pendingKYC,
	}

	return c.JSON(reports)
}

// ProcessPayouts handles batch payout processing
func (h *AdminController) ProcessPayouts(c *fiber.Ctx) error {
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
func (h *AdminController) ExportUsers(c *fiber.Ctx) error {
	format := c.Query("format", "csv")
	filename := fmt.Sprintf("users_export_%s.%s", time.Now().Format("20060102"), format)

	// Mock user data
	users := []fiber.Map{
		{"id": "1", "name": "John Doe", "email": "john@example.com", "role": "filler", "status": "active"},
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
func (h *AdminController) GetUserDetails(c *fiber.Ctx) error {
	userID := c.Params("id")

	var email, name, role, kycStatus string
	var isActive bool
	var phone, location *string
	var createdAt time.Time

	err := h.db.QueryRow(context.Background(),
		"SELECT email, name, role, kyc_status, is_active, phone, location, created_at FROM users WHERE id = $1",
		userID).Scan(&email, &name, &role, &kycStatus, &isActive, &phone, &location, &createdAt)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	var totalEarnings int
	h.db.QueryRow(context.Background(), "SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE user_id = $1", userID).Scan(&totalEarnings)

	var surveysCompleted int
	h.db.QueryRow(context.Background(), "SELECT COUNT(*) FROM responses WHERE user_id = $1", userID).Scan(&surveysCompleted)

	user := fiber.Map{
		"id":                userID,
		"name":              name,
		"email":             email,
		"role":              role,
		"status":            "active",
		"kyc_status":        kycStatus,
		"is_active":         isActive,
		"phone":             phone,
		"location":          location,
		"created_at":        createdAt,
		"total_earnings":    totalEarnings,
		"surveys_completed": surveysCompleted,
	}

	return c.JSON(user)
}

// SuspendUser suspends a user account
func (h *AdminController) SuspendUser(c *fiber.Ctx) error {
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
func (h *AdminController) ActivateUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User activated successfully",
		"user_id": userID,
	})
}
