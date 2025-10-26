package services

import (
	"bytes"
	"fmt"
	"mime/multipart"
	"onetimer-backend/config"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client *s3.S3
	bucket string
}

func NewS3Service(cfg *config.Config) (*S3Service, error) {
	if cfg.AWSAccessKey == "" || cfg.AWSSecretKey == "" {
		return nil, fmt.Errorf("AWS credentials not configured")
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(cfg.AWSRegion),
		Credentials: credentials.NewStaticCredentials(
			cfg.AWSAccessKey,
			cfg.AWSSecretKey,
			"",
		),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &S3Service{
		client: s3.New(sess),
		bucket: cfg.S3Bucket,
	}, nil
}

func (s *S3Service) UploadFile(file multipart.File, header *multipart.FileHeader, folder string) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s/%s%s", folder, uuid.New().String(), ext)

	// Read file content
	buf := bytes.NewBuffer(nil)
	if _, err := buf.ReadFrom(file); err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Upload to S3
	_, err := s.client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(filename),
		Body:        bytes.NewReader(buf.Bytes()),
		ContentType: aws.String(header.Header.Get("Content-Type")),
		ACL:         aws.String("public-read"),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Return public URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, "us-east-1", filename)
	return url, nil
}

func (s *S3Service) GeneratePresignedURL(key string, expiration time.Duration) (string, error) {
	req, _ := s.client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	url, err := req.Presign(expiration)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return url, nil
}