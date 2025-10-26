package services

import (
	"crypto/rand"

	"math/big"
	"time"
)

type OTPService struct {
	length int
	expiry time.Duration
}

func NewOTPService() *OTPService {
	return &OTPService{
		length: 6,
		expiry: 5 * time.Minute,
	}
}

func (s *OTPService) Generate() (string, error) {
	otp := ""
	for i := 0; i < s.length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		otp += num.String()
	}
	return otp, nil
}

func (s *OTPService) IsExpired(createdAt time.Time) bool {
	return time.Since(createdAt) > s.expiry
}

func (s *OTPService) GetExpiryTime() time.Duration {
	return s.expiry
}