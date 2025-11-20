package services

import (
	"fmt"
	"mime/multipart"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type StorageService struct {
	uploader *s3manager.Uploader
	bucket   string
}

func NewStorageService(region, accessKeyID, secretAccessKey, bucket string) (*StorageService, error) {
	if region == "" || accessKeyID == "" || secretAccessKey == "" || bucket == "" {
		return nil, fmt.Errorf("AWS credentials and bucket name are required")
	}

	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credentials.NewStaticCredentials(accessKeyID, secretAccessKey, ""),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	uploader := s3manager.NewUploader(sess)

	return &StorageService{
		uploader: uploader,
		bucket:   bucket,
	}, nil
}

func (s *StorageService) UploadFile(fileHeader *multipart.FileHeader, key string) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	result, err := s.uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to S3: %w", err)
	}

	return result.Location, nil
}
