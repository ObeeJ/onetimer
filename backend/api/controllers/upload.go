package controllers

import (
	"fmt"
	"onetimer-backend/cache"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UploadHandler struct {
	cache *cache.Cache
}

func NewUploadHandler(cache *cache.Cache) *UploadHandler {
	return &UploadHandler{cache: cache}
}

func (h *UploadHandler) UploadKYC(c *fiber.Ctx) error {
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

	// TODO: Upload to AWS S3
	// For now, save locally
	if err := c.SaveFile(file, fmt.Sprintf("./uploads/%s", filename)); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
	}

	return c.JSON(fiber.Map{
		"ok":       true,
		"filename": filename,
		"url":      fmt.Sprintf("/uploads/%s", filename),
		"message":  "KYC document uploaded successfully",
	})
}

func (h *UploadHandler) UploadSurveyMedia(c *fiber.Ctx) error {
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

	// TODO: Upload to AWS S3
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

// UploadResponseImage handles image uploads for survey responses
func (h *UploadHandler) UploadResponseImage(c *fiber.Ctx) error {
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

	// Save file
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
