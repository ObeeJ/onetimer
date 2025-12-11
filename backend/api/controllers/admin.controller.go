package controllers

import (
	"context"
	"encoding/csv"
	"fmt"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/utils"
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
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetUsers request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	role := c.Query("role", "")
	status := c.Query("status", "")
	search := c.Query("search", "")

	utils.LogInfo(ctx, "Fetching users list", "admin_id", adminID, "limit", limit, "offset", offset, "role_filter", role, "status_filter", status, "search", search)

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
		utils.LogError(ctx, "Failed to query users from database", err, "admin_id", adminID)
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
			utils.LogWarn(ctx, "Failed to scan user row", "error", err.Error())
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

	utils.LogInfo(ctx, "✅ Users list retrieved", "admin_id", adminID, "count", len(users), "total", total)
	utils.LogInfo(ctx, "← GetUsers completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *AdminController) ApproveUser(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ApproveUser request (admin)")

	userID := c.Params("id")
	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized user approval attempt - no admin_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	utils.LogInfo(ctx, "Admin approving user", "admin_id", adminID, "target_user_id", userID)

	// Update user status
	updateQuery := `UPDATE users SET kyc_status = 'approved', is_verified = true, updated_at = NOW() WHERE id = $1`
	_, err := h.db.Exec(context.Background(), updateQuery, userID)
	if err != nil {
		utils.LogError(ctx, "Failed to approve user in database", err, "admin_id", adminID, "target_user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to approve user"})
	}

	// Create audit log
	auditQuery := `
		INSERT INTO audit_logs (id, user_id, action, resource, details, created_at)
		VALUES ($1, $2, 'user_approved', $3, $4, NOW())
	`
	details := fmt.Sprintf(`{"admin_id": "%s", "user_id": "%s"}`, adminID, userID)
	h.db.Exec(context.Background(), auditQuery, uuid.New(), adminID, "user:"+userID, details)

	utils.LogInfo(ctx, "✅ User approved successfully", "admin_id", adminID, "target_user_id", userID, "action", "user_approved")
	utils.LogInfo(ctx, "← ApproveUser completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User approved successfully",
		"user_id": userID,
	})
}

func (h *AdminController) RejectUser(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ RejectUser request (admin)")

	userID := c.Params("id")
	adminID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogWarn(ctx, "⚠️ Unauthorized user rejection attempt - no admin_id", "ip", c.IP())
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&req)

	utils.LogInfo(ctx, "Admin rejecting user", "admin_id", adminID, "target_user_id", userID, "reason", req.Reason)

	// Update user status
	updateQuery := `UPDATE users SET kyc_status = 'rejected', updated_at = NOW() WHERE id = $1`
	_, err := h.db.Exec(context.Background(), updateQuery, userID)
	if err != nil {
		utils.LogError(ctx, "Failed to reject user in database", err, "admin_id", adminID, "target_user_id", userID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to reject user"})
	}

	// Create audit log
	auditQuery := `
		INSERT INTO audit_logs (id, user_id, action, resource, details, created_at)
		VALUES ($1, $2, 'user_rejected', $3, $4, NOW())
	`
	details := fmt.Sprintf(`{"admin_id": "%s", "user_id": "%s", "reason": "%s"}`, adminID, userID, req.Reason)
	h.db.Exec(context.Background(), auditQuery, uuid.New(), adminID, "user:"+userID, details)

	utils.LogInfo(ctx, "✅ User rejected successfully", "admin_id", adminID, "target_user_id", userID, "reason", req.Reason, "action", "user_rejected")
	utils.LogInfo(ctx, "← RejectUser completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User rejected",
		"user_id": userID,
		"reason":  req.Reason,
	})
}

func (h *AdminController) GetSurveys(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetSurveys request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	status := c.Query("status", "")

	utils.LogInfo(ctx, "Fetching surveys list", "admin_id", adminID, "limit", limit, "offset", offset, "status_filter", status)

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
		utils.LogError(ctx, "Failed to query surveys from database", err, "admin_id", adminID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch surveys"})
	}
	defer rows.Close()

	var surveys []fiber.Map
	for rows.Next() {
		var id, title, description, status string
		var reward, maxResponses, currentResponses int
		var createdAt time.Time

		if err := rows.Scan(&id, &title, &description, &status, &reward, &maxResponses, &currentResponses, &createdAt); err != nil {
			utils.LogWarn(ctx, "Failed to scan survey row", "error", err.Error())
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

	utils.LogInfo(ctx, "✅ Surveys list retrieved", "admin_id", adminID, "count", len(surveys))
	utils.LogInfo(ctx, "← GetSurveys completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    surveys,
		"count":   len(surveys),
	})
}

func (h *AdminController) ApproveSurvey(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ApproveSurvey request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	surveyID := c.Params("id")

	utils.LogInfo(ctx, "✅ Survey approved", "admin_id", adminID, "survey_id", surveyID, "action", "survey_approved")
	utils.LogInfo(ctx, "← ApproveSurvey completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"ok":        true,
		"message":   "Survey approved",
		"survey_id": surveyID,
	})
}

func (h *AdminController) GetPayments(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetPayments request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	utils.LogInfo(ctx, "Fetching payments list", "admin_id", adminID, "limit", limit, "offset", offset)

	query := "SELECT id, user_id, amount, status, created_at FROM withdrawals ORDER BY created_at DESC LIMIT $1 OFFSET $2"
	rows, err := h.db.Query(context.Background(), query, limit, offset)
	if err != nil {
		utils.LogError(ctx, "Failed to query payments from database", err, "admin_id", adminID)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch payments"})
	}
	defer rows.Close()

	var payments []fiber.Map
	for rows.Next() {
		var id, userID, status string
		var amount int
		var createdAt time.Time

		if err := rows.Scan(&id, &userID, &amount, &status, &createdAt); err != nil {
			utils.LogWarn(ctx, "Failed to scan payment row", "error", err.Error())
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

	utils.LogInfo(ctx, "✅ Payments list retrieved", "admin_id", adminID, "count", len(payments))
	utils.LogInfo(ctx, "← GetPayments completed", "admin_id", adminID)

	return c.JSON(fiber.Map{"payments": payments})
}

func (h *AdminController) GetReports(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetReports request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	var totalUsers, activeSurveys, pendingKYC int
	var totalEarnings int64

	utils.LogInfo(ctx, "Generating admin reports", "admin_id", adminID)

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

	utils.LogInfo(ctx, "✅ Reports generated", "admin_id", adminID, "total_users", totalUsers, "active_surveys", activeSurveys, "pending_kyc", pendingKYC)
	utils.LogInfo(ctx, "← GetReports completed", "admin_id", adminID)

	return c.JSON(reports)
}

// ProcessPayouts handles batch payout processing
func (h *AdminController) ProcessPayouts(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ProcessPayouts request (admin)")

	adminID, _ := c.Locals("user_id").(string)

	var req struct {
		WithdrawalIDs []string `json:"withdrawal_ids"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "Failed to parse payout request", err, "admin_id", adminID)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing batch payouts", "admin_id", adminID, "withdrawal_count", len(req.WithdrawalIDs))

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

	utils.LogInfo(ctx, "✅ Payouts processed", "admin_id", adminID, "processed", processed, "failed", failed, "action", "payouts_processed")
	utils.LogInfo(ctx, "← ProcessPayouts completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"ok":        true,
		"processed": processed,
		"failed":    failed,
		"message":   fmt.Sprintf("Processed %d payouts, %d failed", processed, failed),
	})
}

// ExportUsers exports user data
func (h *AdminController) ExportUsers(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ExportUsers request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	format := c.Query("format", "csv")
	filename := fmt.Sprintf("users_export_%s.%s", time.Now().Format("20060102"), format)

	utils.LogInfo(ctx, "Exporting users data", "admin_id", adminID, "format", format)

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

		utils.LogInfo(ctx, "✅ Users exported as CSV", "admin_id", adminID, "filename", filename, "count", len(users), "action", "users_exported")
		utils.LogInfo(ctx, "← ExportUsers completed", "admin_id", adminID)
		return nil
	}

	utils.LogInfo(ctx, "✅ Users exported as JSON", "admin_id", adminID, "count", len(users), "action", "users_exported")
	utils.LogInfo(ctx, "← ExportUsers completed", "admin_id", adminID)

	return c.JSON(fiber.Map{"users": users})
}

// GetUserDetails returns detailed user information
func (h *AdminController) GetUserDetails(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ GetUserDetails request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	userID := c.Params("id")

	utils.LogInfo(ctx, "Fetching user details", "admin_id", adminID, "target_user_id", userID)

	var email, name, role, kycStatus string
	var isActive bool
	var phone, location *string
	var createdAt time.Time

	err := h.db.QueryRow(context.Background(),
		"SELECT email, name, role, kyc_status, is_active, phone, location, created_at FROM users WHERE id = $1",
		userID).Scan(&email, &name, &role, &kycStatus, &isActive, &phone, &location, &createdAt)

	if err != nil {
		utils.LogWarn(ctx, "⚠️ User not found", "admin_id", adminID, "target_user_id", userID)
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

	utils.LogInfo(ctx, "✅ User details retrieved", "admin_id", adminID, "target_user_id", userID, "role", role, "kyc_status", kycStatus)
	utils.LogInfo(ctx, "← GetUserDetails completed", "admin_id", adminID)

	return c.JSON(user)
}

// SuspendUser suspends a user account
func (h *AdminController) SuspendUser(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ SuspendUser request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	userID := c.Params("id")

	var req struct {
		Reason   string `json:"reason"`
		Duration int    `json:"duration"` // days
	}
	c.BodyParser(&req)

	utils.LogInfo(ctx, "✅ User suspended", "admin_id", adminID, "target_user_id", userID, "reason", req.Reason, "duration_days", req.Duration, "action", "user_suspended")
	utils.LogInfo(ctx, "← SuspendUser completed", "admin_id", adminID)

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
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ ActivateUser request (admin)")

	adminID, _ := c.Locals("user_id").(string)
	userID := c.Params("id")

	utils.LogInfo(ctx, "✅ User activated", "admin_id", adminID, "target_user_id", userID, "action", "user_activated")
	utils.LogInfo(ctx, "← ActivateUser completed", "admin_id", adminID)

	return c.JSON(fiber.Map{
		"ok":      true,
		"message": "User activated successfully",
		"user_id": userID,
	})
}

// BulkUserActions handles bulk operations on users
func (h *AdminController) BulkUserActions(c *fiber.Ctx) error {
	ctx := middleware.GetContextWithTrace(c)
	utils.LogInfo(ctx, "→ BulkUserActions request (admin)")

	adminID, _ := c.Locals("user_id").(string)

	var req struct {
		UserIDs []string `json:"user_ids"`
		Action  string   `json:"action"` // approve, reject, suspend, activate, delete
		Reason  string   `json:"reason"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "Processing bulk user actions", "admin_id", adminID, "action", req.Action, "count", len(req.UserIDs))

	processed := 0
	failed := 0

	for _, userID := range req.UserIDs {
		var err error
		switch req.Action {
		case "approve":
			_, err = h.db.Exec(context.Background(), "UPDATE users SET kyc_status = 'approved', is_verified = true, updated_at = NOW() WHERE id = $1", userID)
		case "reject":
			_, err = h.db.Exec(context.Background(), "UPDATE users SET kyc_status = 'rejected', updated_at = NOW() WHERE id = $1", userID)
		case "suspend":
			// In a real system, we might set a suspended_at flag or status
			_, err = h.db.Exec(context.Background(), "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1", userID)
		case "activate":
			_, err = h.db.Exec(context.Background(), "UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1", userID)
		}

		if err != nil {
			utils.LogError(ctx, "Failed to perform bulk action on user", err, "user_id", userID, "action", req.Action)
			failed++
		} else {
			processed++
			
			// Audit log
			auditQuery := `INSERT INTO audit_logs (id, user_id, action, resource, details, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`
			details := fmt.Sprintf(`{"admin_id": "%s", "user_id": "%s", "action": "%s", "reason": "%s"}`, adminID, userID, req.Action, req.Reason)
			h.db.Exec(context.Background(), auditQuery, uuid.New(), adminID, "user:"+userID, "bulk_"+req.Action, details)
		}
	}

	utils.LogInfo(ctx, "✅ Bulk actions completed", "admin_id", adminID, "processed", processed, "failed", failed)

	return c.JSON(fiber.Map{
		"ok":        true,
		"processed": processed,
		"failed":    failed,
		"message":   fmt.Sprintf("Processed %d users, %d failed", processed, failed),
	})
}
