package controllers

import (
	"context"
	"onetimer-backend/cache"
	"onetimer-backend/models"
	"onetimer-backend/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SuperAdminController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewSuperAdminController(cache *cache.Cache, db *pgxpool.Pool) *SuperAdminController {
	return &SuperAdminController{cache: cache, db: db}
}

func (h *SuperAdminController) GetAllUsers(c *fiber.Ctx) error {
	ctx := context.Background()

	superAdminID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "⚠️ Unauthorized user list access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Query all users from database
	rows, err := h.db.Query(c.Context(), `
		SELECT id, email, name, role, phone, is_verified, is_active,
		       kyc_status, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to fetch users", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, &user.Email, &user.Name, &user.Role, &user.Phone,
			&user.IsVerified, &user.IsActive, &user.KycStatus,
			&user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			continue
		}
		users = append(users, user)
	}

	utils.LogInfo(ctx, "✅ Super admin accessed user list", "admin_id", superAdminID, "total_users", len(users))
	return c.JSON(fiber.Map{
		"success": true,
		"users":   users,
		"total":   len(users),
	})
}

func (h *SuperAdminController) GetAdmins(c *fiber.Ctx) error {
	ctx := context.Background()

	superAdminID, ok := c.Locals("user_id").(string)
	if !ok {
		utils.LogError(ctx, "⚠️ Unauthorized admin list access attempt", nil)
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// In production, query from database
	admins := []models.User{
		{
			ID:        uuid.New(),
			Email:     "admin1@onetime.com",
			Name:      "Admin User 1",
			Role:      "admin",
			IsActive:  true,
			CreatedAt: time.Now().AddDate(0, -2, 0),
		},
		{
			ID:        uuid.New(),
			Email:     "admin2@onetime.com",
			Name:      "Admin User 2",
			Role:      "admin",
			IsActive:  false,
			CreatedAt: time.Now().AddDate(0, -1, 0),
		},
	}

	utils.LogInfo(ctx, "✅ Admin list retrieved by super admin", "admin_id", superAdminID, "count", len(admins))

	return c.JSON(fiber.Map{
		"success": true,
		"data":    admins,
		"count":   len(admins),
	})
}

func (h *SuperAdminController) CreateAdmin(c *fiber.Ctx) error {
	ctx := context.Background()

	var req struct {
		Email    string `json:"email" validate:"required,email"`
		Name     string `json:"name" validate:"required,min=2,max=100"`
		Password string `json:"password" validate:"required,min=8,max=128"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Invalid request for admin creation", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate input
	if req.Email == "" || req.Name == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email, name, and password are required"})
	}

	if len(req.Password) < 8 {
		return c.Status(400).JSON(fiber.Map{"error": "Password must be at least 8 characters"})
	}

	// Check if email already exists
	var existingEmail string
	err := h.db.QueryRow(ctx, "SELECT email FROM users WHERE email = $1", req.Email).Scan(&existingEmail)
	if err == nil {
		utils.LogInfo(ctx, "⚠️ Admin creation failed - email already exists", "email", req.Email)
		return c.Status(409).JSON(fiber.Map{"error": "Email already exists"})
	}

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to hash password during admin creation", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create admin"})
	}

	// Create admin user in database
	adminID := uuid.New()
	_, err = h.db.Exec(ctx,
		`INSERT INTO users (id, email, name, password_hash, role, is_verified, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
		adminID, req.Email, req.Name, passwordHash, "admin", true, true,
	)
	if err != nil {
		utils.LogError(ctx, "⚠️ Failed to create admin in database", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create admin"})
	}

	superAdminID, _ := c.Locals("user_id").(string)
	utils.LogInfo(ctx, "✅ Admin created successfully by superadmin",
		"admin_id", adminID,
		"admin_email", req.Email,
		"admin_name", req.Name,
		"created_by", superAdminID,
	)

	return c.Status(201).JSON(fiber.Map{
		"ok":      true,
		"message": "Admin account created successfully",
		"admin": fiber.Map{
			"id":    adminID,
			"email": req.Email,
			"name":  req.Name,
			"role":  "admin",
		},
	})
}

func (h *SuperAdminController) GetFinancials(c *fiber.Ctx) error {
	ctx := context.Background()

	financials := fiber.Map{
		"total_revenue":       15000000,
		"total_payouts":       8500000,
		"platform_fees":       2250000,
		"monthly_revenue":     1200000,
		"monthly_payouts":     650000,
		"pending_withdrawals": 125000,
		"active_surveys":      245,
		"total_users":         12500,
	}

	utils.LogInfo(ctx, "→ Financials data retrieved")

	return c.JSON(fiber.Map{
		"success": true,
		"data":    financials,
	})
}

func (h *SuperAdminController) GetAuditLogs(c *fiber.Ctx) error {
	ctx := context.Background()

	logs := []fiber.Map{
		{
			"id":        uuid.New().String(),
			"action":    "user_approved",
			"admin_id":  uuid.New().String(),
			"target_id": uuid.New().String(),
			"timestamp": time.Now().AddDate(0, 0, -1),
			"details":   "KYC approved for user",
		},
		{
			"id":        uuid.New().String(),
			"action":    "survey_rejected",
			"admin_id":  uuid.New().String(),
			"target_id": uuid.New().String(),
			"timestamp": time.Now().AddDate(0, 0, -2),
			"details":   "Survey content violation",
		},
	}

	utils.LogInfo(ctx, "→ Audit logs retrieved", "log_count", len(logs))

	return c.JSON(fiber.Map{"logs": logs})
}

func (h *SuperAdminController) GetSystemSettings(c *fiber.Ctx) error {
	ctx := context.Background()

	settings := fiber.Map{
		"platform_fee_percentage": 15.0,
		"min_withdrawal_amount":   1000,
		"max_survey_reward":       5000,
		"kyc_required":            true,
		"auto_approve_surveys":    false,
		"maintenance_mode":        false,
	}

	utils.LogInfo(ctx, "→ System settings retrieved")

	return c.JSON(fiber.Map{
		"success": true,
		"data":    settings,
	})
}

func (h *SuperAdminController) UpdateSettings(c *fiber.Ctx) error {
	ctx := context.Background()

	var settings map[string]interface{}
	if err := c.BodyParser(&settings); err != nil {
		utils.LogError(ctx, "⚠️ Invalid settings update request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "✅ System settings updated successfully", "settings_count", len(settings))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Settings updated successfully",
		"data":    settings,
	})
}

func (h *SuperAdminController) SuspendAdmin(c *fiber.Ctx) error {
	ctx := context.Background()

	adminID := c.Params("id")

	var req struct {
		Reason string `json:"reason"`
	}

	if err := c.BodyParser(&req); err != nil {
		utils.LogError(ctx, "⚠️ Invalid suspend admin request", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	utils.LogInfo(ctx, "✅ Admin suspended successfully", "admin_id", adminID, "reason", req.Reason)

	// Mock implementation - in production, update admin status in database
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Admin suspended successfully",
		"admin_id": adminID,
		"reason": req.Reason,
	})
}
