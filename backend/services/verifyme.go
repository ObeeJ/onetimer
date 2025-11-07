package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type VerifyMeService struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

type NINVerificationRequest struct {
	NIN         string `json:"nin"`
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	DateOfBirth string `json:"date_of_birth,omitempty"`
}

type NINVerificationResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		NIN         string `json:"nin"`
		FirstName   string `json:"first_name"`
		LastName    string `json:"last_name"`
		DateOfBirth string `json:"date_of_birth"`
		Gender      string `json:"gender"`
		Photo       string `json:"photo"`
		Verified    bool   `json:"verified"`
	} `json:"data"`
}

func NewVerifyMeService(apiKey string) *VerifyMeService {
	return &VerifyMeService{
		apiKey:  apiKey,
		baseURL: "https://api.verifyme.ng/v1",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *VerifyMeService) VerifyNIN(req NINVerificationRequest) (*NINVerificationResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", s.baseURL+"/nin/verify", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	var verifyResp NINVerificationResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("verification failed: %s", verifyResp.Message)
	}

	return &verifyResp, nil
}
