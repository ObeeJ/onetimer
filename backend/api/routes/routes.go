package routes

import (
	"onetimer-backend/api/controllers"
	"onetimer-backend/api/handlers"
	"onetimer-backend/api/middleware"
	"onetimer-backend/cache"
	"onetimer-backend/config"
	"onetimer-backend/database"
	"onetimer-backend/repository"
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func SetupRoutes(app *fiber.App, cache *cache.Cache, cfg *config.Config, db *database.SupabaseDB, emailService *services.EmailService, paystackService *services.PaystackService, storageService *services.StorageService, rateLimiter *middleware.RateLimiter, wsHub *services.Hub) {
	// Health endpoints
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"env":    cfg.Env,
			"time":   fiber.Map{"timestamp": "2024-01-01T00:00:00Z"},
		})
	})

	api := app.Group("/api")

	// Apply global rate limiting (100 requests per minute per IP/user)
	if rateLimiter != nil {
		api.Use(rateLimiter.PerEndpointRateLimit())
	}

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "ok",
			"env":       cfg.Env,
			"api":       "ready",
			"ratelimit": rateLimiter != nil,
		})
	})

	// Render health check endpoint
	api.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"ready":  true,
		})
	})

	// Initialize repositories
	baseRepo := repository.NewBaseRepository(db)
	userRepo := repository.NewUserRepository(baseRepo)
	auditRepo := repository.NewAuditRepository(baseRepo)
	notificationRepo := repository.NewNotificationRepository(baseRepo)
	creditRepo := repository.NewCreditRepository(baseRepo)
	surveyRepo := repository.NewSurveyRepository(baseRepo)

	// Initialize controllers (Updated to use validated versions)
	userController := controllers.NewUserControllerWithDB(cache, db, userRepo)
	authController := controllers.NewAuthController(cache, cfg.JWTSecret)
	adminController := controllers.NewAdminController(cache, db.Pool)  // Fixed
	auditController := controllers.NewAuditController(cache, auditRepo)
	billingController := controllers.NewBillingController()
	creditsController := controllers.NewCreditsController(cache, cfg, creditRepo)
	earningsController := controllers.NewEarningsController(cache, db.Pool, cfg)
	eligibilityController := controllers.NewEligibilityController(cache, db, userRepo)
	exportController := controllers.NewExportController(cache, db.Pool)
	fillerController := controllers.NewFillerController(cache, db.Pool)
	loginController := controllers.NewLoginHandler(cache, cfg.JWTSecret, userRepo)
	logoutController := controllers.NewLogoutController()
	onboardingController := controllers.NewOnboardingController(cache, db.Pool)
	paymentController := controllers.NewPaymentController(cache, cfg.PaystackSecret)
	referralController := controllers.NewReferralController(cache, db.Pool)
	superAdminController := controllers.NewSuperAdminController(cache, db.Pool)
	surveyController := controllers.NewSurveyController(cache, surveyRepo)
	uploadController := controllers.NewUploadController(cache, storageService)
	withdrawalController := controllers.NewWithdrawalController(cache, db.Pool, cfg.PaystackSecret)
	waitlistController := controllers.NewWaitlistController(db.Pool, emailService)
	analyticsController := controllers.NewAnalyticsController(cache, db.Pool)
	wsController := controllers.NewWebSocketController(wsHub)
	notificationController := controllers.NewNotificationHandler(cache, notificationRepo)
	kycHandler := handlers.NewKYCHandler(cfg)

	// WebSocket route (requires upgrade check)
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(wsController.HandleWebSocket))

	// Define JWT middleware for protected routes
	jwtMiddleware := middleware.JWTMiddleware(cfg.JWTSecret)

	// Waitlist routes (public - no auth required)
	api.Post("/waitlist/join", waitlistController.JoinWaitlist)
	api.Get("/waitlist/stats", waitlistController.GetWaitlistStats) // TODO: Add admin middleware

	// User routes
	user := api.Group("/user")
	user.Post("/register", userController.Register)
	user.Get("/profile", jwtMiddleware, userController.GetProfile)
	user.Put("/profile", jwtMiddleware, userController.UpdateProfile)
	user.Post("/kyc", jwtMiddleware, userController.UploadKYC)
	user.Post("/kyc/verify-nin", jwtMiddleware, kycHandler.VerifyKYC)
	user.Post("/change-password", jwtMiddleware, userController.ChangePassword)
	user.Get("/kyc-status", jwtMiddleware, userController.GetKYCStatus)
	user.Get("/preferences", jwtMiddleware, userController.GetPreferences)
	user.Post("/preferences", jwtMiddleware, userController.UpdatePreferences)

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", loginController.Login)
	auth.Post("/logout", logoutController.Logout)
	auth.Post("/send-otp", authController.SendOTP)
	auth.Post("/verify-otp", authController.VerifyOTP)
	auth.Post("/forgot-password", authController.ForgotPassword)
	auth.Post("/reset-password", authController.ResetPassword)

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	admin.Get("/users", adminController.GetUsers)
	admin.Post("/users/:id/approve", adminController.ApproveUser)
	admin.Post("/users/:id/reject", adminController.RejectUser)
	admin.Get("/surveys", adminController.GetSurveys)
	admin.Post("/surveys/:id/approve", adminController.ApproveSurvey)
	admin.Get("/payments", adminController.GetPayments)
	admin.Get("/reports", adminController.GetReports)
	admin.Post("/payouts", adminController.ProcessPayouts)
	admin.Get("/export/users", adminController.ExportUsers)
	admin.Get("/users/:id", adminController.GetUserDetails)
	admin.Post("/users/:id/suspend", adminController.SuspendUser)
	admin.Post("/users/:id/activate", adminController.ActivateUser)

	// Creator routes
	creator := api.Group("/creator")
	creator.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	creator.Get("/dashboard", analyticsController.GetCreatorDashboard)                             // Use analyticsController
	creator.Get("/surveys", surveyController.GetSurveys)                                           // Use surveyController
	creator.Put("/surveys/:id", surveyController.UpdateSurvey)                                     // Use surveyController
	creator.Delete("/surveys/:id", surveyController.DeleteSurvey)                                  // Use surveyController
	creator.Get("/surveys/:id/responses", surveyController.GetSurveyResponses)                     // Use surveyController
	creator.Get("/surveys/:id/analytics", analyticsController.GetSurveyAnalytics)                  // Use analyticsController
	creator.Get("/credits", creditsController.GetCredits)                                          // Use creditsController
	creator.Post("/surveys/:id/export", exportController.ExportSurveyResponses)                    // Use exportController
	creator.Post("/surveys/:id/pause", surveyController.PauseSurvey)                               // Use surveyController
	creator.Post("/surveys/:id/resume", surveyController.ResumeSurvey)                             // Use surveyController
	creator.Post("/surveys/:id/duplicate", surveyController.DuplicateSurvey)                       // Use surveyController
	creator.Get("/surveys/:survey_id/responses/:response_id", surveyController.GetResponseDetails) // Use surveyController

	// Credits routes
	credits := api.Group("/credits")
	credits.Get("/packages", creditsController.GetPackages)
	credits.Post("/purchase", creditsController.PurchaseCredits)
	credits.Post("/purchase/custom", creditsController.PurchaseCustom)

	// Earnings routes
	earnings := api.Group("/earnings")
	earnings.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	earnings.Get("/", earningsController.GetEarnings)
	earnings.Get("", earningsController.GetEarnings)
	earnings.Post("/withdraw", earningsController.WithdrawEarnings)

	// Eligibility routes
	eligibility := api.Group("/eligibility")
	eligibility.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	eligibility.Get("/check", eligibilityController.CheckEligibility)

	// Filler routes
	filler := api.Group("/filler")
	filler.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	filler.Get("/dashboard", fillerController.GetDashboard)
	filler.Get("/surveys", fillerController.GetAvailableSurveys)
	filler.Get("/surveys/completed", fillerController.GetCompletedSurveys)
	filler.Get("/earnings", fillerController.GetEarningsHistory)

	// Export routes
	export := api.Group("/export")
	export.Get("/survey/:id", exportController.ExportSurveyResponses)

	// Analytics routes
	analytics := api.Group("/analytics")
	analytics.Use(middleware.JWTMiddleware(cfg.JWTSecret))

	// Filler analytics
	analytics.Get("/filler/dashboard", analyticsController.GetFillerDashboard)
	analytics.Get("/filler/earnings", analyticsController.GetEarningsBreakdown)

	// Creator analytics
	analytics.Get("/creator/dashboard", analyticsController.GetCreatorDashboard)
	analytics.Get("/creator/surveys/:id", analyticsController.GetSurveyAnalytics)
	analytics.Get("/creator/trends", analyticsController.GetResponseTrends)

	// Admin analytics (requires admin role)
	analytics.Get("/admin/dashboard", analyticsController.GetAdminDashboard)
	analytics.Post("/admin/cache/invalidate", analyticsController.InvalidateCache)

	// Legacy routes (kept for backward compatibility)
	analytics.Get("/dashboard", analyticsController.GetDashboardAnalytics)
	analytics.Get("/surveys/:id", analyticsController.GetSurveyAnalytics)
	analytics.Get("/export/:id", analyticsController.ExportAnalytics)

	// Notifications routes
	notification := api.Group("/notifications")
	notification.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	notification.Get("/", notificationController.GetNotifications)
	notification.Post("/mark-read", notificationController.UpdateNotifications)

	// Onboarding routes
	onboarding := api.Group("/onboarding")
	onboarding.Use(jwtMiddleware) // Add JWT middleware for authentication
	onboarding.Post("/filler", onboardingController.CompleteFillerOnboarding)
	onboarding.Post("/creator", onboardingController.CompleteCreatorOnboarding)
	onboarding.Put("/demographics", onboardingController.UpdateDemographics)
	onboarding.Get("/surveys", onboardingController.GetEligibleSurveys)

	// Payment routes
	payment := api.Group("/payment")
	payment.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	payment.Post("/purchase", paymentController.PurchaseCredits)
	payment.Get("/verify/:reference", paymentController.VerifyPayment)
	payment.Post("/payouts", paymentController.ProcessBatchPayouts)
	payment.Get("/methods", paymentController.GetPaymentMethods)
	payment.Post("/methods", paymentController.AddPaymentMethod)
	payment.Get("/history", paymentController.GetTransactionHistory)
	payment.Post("/refund/:id", paymentController.RefundTransaction)

	// Referral routes
	referral := api.Group("/referral")
	referral.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	referral.Get("/", referralController.GetReferrals)
	referral.Post("/code", referralController.GenerateCode)
	referral.Get("/stats", referralController.GetStats)

	// Super Admin routes
	superAdmin := api.Group("/super-admin")
	superAdmin.Use(middleware.JWTMiddleware(cfg.JWTSecret))
	superAdmin.Get("/users", superAdminController.GetAllUsers)
	superAdmin.Get("/admins", superAdminController.GetAdmins)
	superAdmin.Post("/admins", superAdminController.CreateAdmin)
	superAdmin.Post("/admins/:id/suspend", superAdminController.SuspendAdmin)
	superAdmin.Get("/financials", superAdminController.GetFinancials)
	superAdmin.Post("/audit-logs", auditController.LogAction)
	superAdmin.Get("/audit-logs", auditController.GetAuditLogs)
	superAdmin.Get("/settings", superAdminController.GetSystemSettings)
	superAdmin.Put("/settings", superAdminController.UpdateSettings)

	// Survey routes (consolidated - single group with selective middleware)
	survey := api.Group("/survey")

	// Public GET endpoints (no middleware)
	survey.Get("/", surveyController.GetSurveys)
	survey.Get("/:id", surveyController.GetSurvey)
	survey.Get("/:id/questions", surveyController.GetSurveyQuestions)
	survey.Get("/templates", surveyController.GetSurveyTemplates)

	// Protected POST/PUT/DELETE endpoints (with JWT middleware)
	survey.Post("/", jwtMiddleware, surveyController.CreateSurvey)
	survey.Put("/:id", jwtMiddleware, surveyController.UpdateSurvey)
	survey.Delete("/:id", jwtMiddleware, surveyController.DeleteSurvey)
	survey.Post("/:id/submit", jwtMiddleware, surveyController.SubmitResponse)
	survey.Post("/:id/start", jwtMiddleware, surveyController.StartSurvey)
	survey.Post("/:id/progress", jwtMiddleware, surveyController.SaveProgress)
	survey.Post("/:id/pause", jwtMiddleware, surveyController.PauseSurvey)
	survey.Post("/:id/resume", jwtMiddleware, surveyController.ResumeSurvey)
	survey.Post("/import", jwtMiddleware, surveyController.ImportSurvey)
	survey.Post("/:id/duplicate", jwtMiddleware, surveyController.DuplicateSurvey)
	survey.Post("/draft", jwtMiddleware, surveyController.SaveSurveyDraft)

	// Upload routes
	upload := api.Group("/upload")
	upload.Post("/kyc", uploadController.UploadKYC)
	upload.Post("/survey-media", uploadController.UploadSurveyMedia)
	upload.Post("/response-image/:survey_id", uploadController.UploadResponseImage)

	// Withdrawal routes
	withdrawal := api.Group("/withdrawal")
	withdrawal.Post("/request", jwtMiddleware, withdrawalController.RequestWithdrawal)
	withdrawal.Get("/history", jwtMiddleware, withdrawalController.GetWithdrawals)
	withdrawal.Get("/banks", withdrawalController.GetBanks)
	withdrawal.Post("/verify-account", jwtMiddleware, withdrawalController.VerifyAccount)

	// Billing routes
	billing := api.Group("/billing")
	billing.Post("/calculate", billingController.CalculateCost)
	billing.Post("/validate-reward", billingController.ValidateReward)
	billing.Get("/pricing-tiers", billingController.GetPricingTiers)

	// 404 handler for unmatched routes
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "The requested endpoint does not exist",
			"success": false,
		})
	})
}
