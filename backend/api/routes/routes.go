package routes

import (
	"onetimer-backend/api/controllers"
	"onetimer-backend/config"
	"onetimer-backend/cache"
	"onetimer-backend/services"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRoutes(app *fiber.App, cache *cache.Cache, cfg *config.Config, db *pgxpool.Pool, emailService *services.EmailService, paystackService *services.PaystackService) {
	// Health endpoints
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"env":    cfg.Env,
			"time":   fiber.Map{"timestamp": "2024-01-01T00:00:00Z"},
		})
	})

	api := app.Group("/api")
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"env":    cfg.Env,
			"api":    "ready",
		})
	})

	// Initialize controllers
	userController := controllers.NewUserController(cache)
	authController := controllers.NewAuthController(cache, cfg.JWTSecret)
	adminController := controllers.NewAdminController(cache, db)
	billingController := controllers.NewBillingController()
	creatorController := controllers.NewCreatorController(cache)
	creditsController := controllers.NewCreditsController(cache, cfg)
	earningsController := controllers.NewEarningsController(cache, cfg)
	eligibilityController := controllers.NewEligibilityController(cache, db)
	exportController := controllers.NewExportController(cache, db)
	loginController := controllers.NewLoginController(cache, cfg.JWTSecret)
	logoutController := controllers.NewLogoutController()
	onboardingController := controllers.NewOnboardingController(cache, db)
	paymentController := controllers.NewPaymentController(cache)
	profileController := controllers.NewProfileController(cache, db)
	referralController := controllers.NewReferralController(cache)
	superAdminController := controllers.NewSuperAdminController(cache)
	surveyController := controllers.NewSurveyController(db, cache)
	uploadController := controllers.NewUploadController(cache)
	withdrawalController := controllers.NewWithdrawalController(cache, db, cfg.PaystackSecret)

	// User routes
	user := api.Group("/user")
	user.Post("/register", userController.Register)
	user.Get("/profile", profileController.GetProfile)
	user.Put("/profile", profileController.UpdateProfile)
	user.Post("/kyc", uploadController.UploadKYC)

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", loginController.Login)
	auth.Post("/logout", logoutController.Logout)
	auth.Post("/send-otp", authController.SendOTP)
	auth.Post("/verify-otp", authController.VerifyOTP)

	// Admin routes
	admin := api.Group("/admin")
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
	creator.Get("/dashboard", creatorController.GetDashboard)
	creator.Get("/surveys", creatorController.GetMySurveys)
	creator.Put("/surveys/:id", creatorController.UpdateSurvey)
	creator.Delete("/surveys/:id", creatorController.DeleteSurvey)
	creator.Get("/surveys/:id/responses", creatorController.GetSurveyResponses)
	creator.Get("/surveys/:id/analytics", creatorController.GetAnalytics)
	creator.Get("/credits", creatorController.GetCredits)
	creator.Post("/surveys/:id/export", creatorController.ExportSurveyResponses)
	creator.Post("/surveys/:id/pause", creatorController.PauseSurvey)
	creator.Post("/surveys/:id/resume", creatorController.ResumeSurvey)
	creator.Post("/surveys/:id/duplicate", creatorController.DuplicateSurvey)
	creator.Get("/surveys/:survey_id/responses/:response_id", creatorController.GetResponseDetails)

	// Credits routes
	credits := api.Group("/credits")
	credits.Get("/packages", creditsController.GetPackages)
	credits.Post("/purchase", creditsController.PurchaseCredits)
	credits.Post("/purchase/custom", creditsController.PurchaseCustom)

	// Earnings routes
	earnings := api.Group("/earnings")
	earnings.Get("/", earningsController.GetEarnings)
	earnings.Post("/withdraw", earningsController.WithdrawEarnings)

	// Eligibility routes
	eligibility := api.Group("/eligibility")
	eligibility.Get("/check", eligibilityController.CheckEligibility)

	// Export routes
	export := api.Group("/export")
	export.Get("/survey/:id", exportController.ExportSurveyResponses)

	// Onboarding routes
	onboarding := api.Group("/onboarding")
	onboarding.Post("/filler", onboardingController.CompleteFillerOnboarding)
	onboarding.Put("/demographics", onboardingController.UpdateDemographics)
	onboarding.Get("/surveys", onboardingController.GetEligibleSurveys)

	// Payment routes
	payment := api.Group("/payment")
	payment.Post("/purchase", paymentController.PurchaseCredits)
	payment.Get("/verify/:reference", paymentController.VerifyPayment)
	payment.Post("/payouts", paymentController.ProcessBatchPayouts)
	payment.Get("/methods", paymentController.GetPaymentMethods)
	payment.Post("/methods", paymentController.AddPaymentMethod)
	payment.Get("/history", paymentController.GetTransactionHistory)
	payment.Post("/refund/:id", paymentController.RefundTransaction)

	// Referral routes
	referral := api.Group("/referral")
	referral.Get("/", referralController.GetReferrals)
	referral.Post("/code", referralController.GenerateCode)
	referral.Get("/stats", referralController.GetStats)

	// Super Admin routes
	superAdmin := api.Group("/super-admin")
	superAdmin.Get("/admins", superAdminController.GetAdmins)
	superAdmin.Post("/admins", superAdminController.CreateAdmin)
	superAdmin.Get("/financials", superAdminController.GetFinancials)
	superAdmin.Get("/audit-logs", superAdminController.GetAuditLogs)
	superAdmin.Get("/settings", superAdminController.GetSystemSettings)
	superAdmin.Put("/settings", superAdminController.UpdateSettings)

	// Survey routes
	survey := api.Group("/survey")
	survey.Post("/", surveyController.CreateSurvey)
	survey.Get("/", surveyController.GetSurveys)
	survey.Get("/:id", surveyController.GetSurvey)
	survey.Put("/:id", surveyController.UpdateSurvey)
	survey.Delete("/:id", surveyController.DeleteSurvey)
	survey.Post("/:id/submit", surveyController.SubmitResponse)
	survey.Get("/:id/questions", surveyController.GetSurveyQuestions)
	survey.Post("/:id/start", surveyController.StartSurvey)
	survey.Post("/:id/progress", surveyController.SaveProgress)
	survey.Post("/:id/pause", surveyController.PauseSurvey)
	survey.Post("/:id/resume", surveyController.ResumeSurvey)
	survey.Post("/import", surveyController.ImportSurvey)
	survey.Post("/:id/duplicate", surveyController.DuplicateSurvey)
	survey.Get("/templates", surveyController.GetSurveyTemplates)
	survey.Post("/draft", surveyController.SaveSurveyDraft)

	// Upload routes
	upload := api.Group("/upload")
	upload.Post("/kyc", uploadController.UploadKYC)
	upload.Post("/survey-media", uploadController.UploadSurveyMedia)
	upload.Post("/response-image/:survey_id", uploadController.UploadResponseImage)

	// Withdrawal routes
	withdrawal := api.Group("/withdrawal")
	withdrawal.Post("/request", withdrawalController.RequestWithdrawal)
	withdrawal.Get("/history", withdrawalController.GetWithdrawals)
	withdrawal.Get("/banks", withdrawalController.GetBanks)
	withdrawal.Post("/verify-account", withdrawalController.VerifyAccount)

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