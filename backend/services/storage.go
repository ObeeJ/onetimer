package services

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"onetimer-backend/config"
	"onetimer-backend/utils"
	"path/filepath"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type StorageService struct {
	s3Client *s3.S3
	bucket   string
	endpoint string
}

func NewStorageService(cfg *config.Config) (*StorageService, error) {
	// Check if storage is configured
	if cfg.AWSAccessKeyID == "" || cfg.AWSSecretAccessKey == "" {
		utils.LogWarn("Storage credentials not configured, uploads will fail")
		return nil, fmt.Errorf("storage not configured")
	}

	// Configure S3-compatible client for Supabase Storage
	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, ""),
		Endpoint:         aws.String(cfg.S3Endpoint),
		Region:           aws.String(cfg.AWSRegion),
		S3ForcePathStyle: aws.Bool(true), // Required for Supabase Storage
	}

	sess, err := session.NewSession(s3Config)
	if err != nil {
		return nil, fmt.Errorf("failed to create storage session: %w", err)
	}

	return &StorageService{
		s3Client: s3.New(sess),
		bucket:   cfg.S3Bucket,
		endpoint: cfg.S3Endpoint,
	}, nil
}

// UploadFile uploads a file to Supabase Storage
func (s *StorageService) UploadFile(file *multipart.FileHeader, folder, filename string) (string, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Read file content
	buffer, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Determine content type
	contentType := getContentType(filename)

	// Construct object key (path in bucket)
	key := fmt.Sprintf("%s/%s", folder, filename)

	// Upload to S3-compatible storage (Supabase)
	_, err = s.s3Client.PutObject(&s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          bytes.NewReader(buffer),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(file.Size),
		ACL:           aws.String("public-read"), // Make file publicly accessible
	})

	if err != nil {
		utils.LogError("Failed to upload file to storage: %v", err)
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// Construct public URL
	publicURL := fmt.Sprintf("%s/object/public/%s/%s", s.endpoint, s.bucket, key)

	utils.LogInfo("File uploaded successfully: %s", publicURL)
	return publicURL, nil
}

// DeleteFile deletes a file from Supabase Storage
func (s *StorageService) DeleteFile(folder, filename string) error {
	key := fmt.Sprintf("%s/%s", folder, filename)

	_, err := s.s3Client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		utils.LogError("Failed to delete file from storage: %v", err)
		return fmt.Errorf("failed to delete file: %w", err)
	}

	utils.LogInfo("File deleted successfully: %s", key)
	return nil
}

// getContentType determines MIME type based on file extension
func getContentType(filename string) string {
	ext := filepath.Ext(filename)
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".pdf":
		return "application/pdf"
	case ".mp4":
		return "video/mp4"
	case ".mov":
		return "video/quicktime"
	default:
		return "application/octet-stream"
	}
}
