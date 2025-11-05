package controllers

import (
	"fmt"
	"onetimer-backend/cache"
	"onetimer-backend/services"
	"onetimer-backend/utils"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UploadController struct {
	cache   *cache.Cache
	storage *services.StorageService
}

func NewUploadController(cache *cache.Cache, storage *services.StorageService) *UploadController {
	return &UploadController{
		cache:   cache,
		storage: storage,
	}
}

func (h *UploadController) UploadKYC(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	file, err := c.FormFile("document")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// Validate file size (5MB limit)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit. It should be less than 5MB"})
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".pdf"}
	
	valid := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			valid = true
			break
		}
	}
	
	if !valid {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid file type"})
	}

	// Generate unique filename
	filename := fmt.Sprintf("kyc_%s_%s%s", userID, uuid.New().String()[:8], ext)

	// Upload to Supabase Storage (S3-compatible)
	if h.storage == nil {
		utils.LogWarn("Storage service not available, saving locally")
		// Fallback to local storage
		if err := c.SaveFile(file, fmt.Sprintf("./uploads/%s", filename)); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
		}
		return c.JSON(fiber.Map{
			"ok":       true,
			"filename": filename,
			"url":      fmt.Sprintf("/uploads/%s", filename),
			"message":  "KYC document uploaded successfully (local storage)",
		})
	}

	// Upload to cloud storage
	publicURL, err := h.storage.UploadFile(file, "kyc", filename)
	if err != nil {
		utils.LogError("Failed to upload to cloud storage: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to upload file"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"filename": filename,
		"url":      publicURL,
		"message":  "KYC document uploaded successfully",
	})
}

func (h *UploadController) UploadSurveyMedia(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	
	file, err := c.FormFile("media")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// Validate file size (5MB limit)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit"})
	}

	// Validate file type for survey media
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov"}
	
	valid := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			valid = true
			break
		}
	}
	
	if !valid {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid file type for survey media"})
	}

	// Generate unique filename
	filename := fmt.Sprintf("survey_%s_%s%s", userID, uuid.New().String()[:8], ext)

	// Upload to Supabase Storage (S3-compatible)
	if h.storage == nil {
		utils.LogWarn("Storage service not available, saving locally")
		if err := c.SaveFile(file, fmt.Sprintf("./uploads/%s", filename)); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
		}
		return c.JSON(fiber.Map{
			"ok":       true,
			"filename": filename,
			"url":      fmt.Sprintf("/uploads/%s", filename),
			"type":     "media",
		})
	}

	// Upload to cloud storage
	publicURL, err := h.storage.UploadFile(file, "survey-media", filename)
	if err != nil {
		utils.LogError("Failed to upload to cloud storage: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to upload file"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"filename": filename,
		"url":      publicURL,
		"type":     "media",
	})
}

// UploadResponseImage handles image uploads for survey responses
func (h *UploadController) UploadResponseImage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	surveyID := c.Params("survey_id")
	
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No image uploaded"})
	}

	// Validate file size (5MB limit)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "Image size exceeds 5MB limit"})
	}

	// Validate image type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png"}
	
	valid := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			valid = true
			break
		}
	}
	
	if !valid {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid image format. Only JPG, JPEG, PNG allowed"})
	}

	// Generate unique filename
	filename := fmt.Sprintf("response_%s_%s_%s%s", surveyID, userID, uuid.New().String()[:8], ext)

	// Upload to Supabase Storage (S3-compatible)
	if h.storage == nil {
		utils.LogWarn("Storage service not available, saving locally")
		if err := c.SaveFile(file, fmt.Sprintf("./uploads/%s", filename)); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save image"})
		}
		return c.JSON(fiber.Map{
			"ok":       true,
			"filename": filename,
			"url":      fmt.Sprintf("/uploads/%s", filename),
			"type":     "response_image",
		})
	}

	// Upload to cloud storage
	publicURL, err := h.storage.UploadFile(file, "responses", filename)
	if err != nil {
		utils.LogError("Failed to upload to cloud storage: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to upload image"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"filename": filename,
		"url":      publicURL,
		"type":     "response_image",
	})
}