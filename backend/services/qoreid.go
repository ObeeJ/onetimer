package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type QoreIDService struct {
	ClientID  string
	SecretKey string
	BaseURL   string
}

type QoreIDRequest struct {
	FirstName   string `json:"firstname"`
	LastName    string `json:"lastname"`
	Phone       string `json:"phone"`
	DateOfBirth string `json:"dob"`
	Gender      string `json:"gender"`
}

type QoreIDResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		ID          string `json:"id"`
		Reference   string `json:"reference"`
		Status      string `json:"status"`
		FirstName   string `json:"firstname"`
		LastName    string `json:"lastname"`
		Phone       string `json:"phone"`
		DateOfBirth string `json:"dob"`
		Gender      string `json:"gender"`
		CreatedAt   string `json:"created_at"`
	} `json:"data"`
}

func NewQoreIDService(clientID, secretKey string) *QoreIDService {
	return &QoreIDService{
		ClientID:  clientID,
		SecretKey: secretKey,
		BaseURL:   "https://api.qoreid.com/token/v2",
	}
}

func (q *QoreIDService) VerifyIdentity(req QoreIDRequest) (*QoreIDResponse, error) {
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", q.BaseURL+"/kyc/identity", bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+q.SecretKey)
	httpReq.Header.Set("X-Client-ID", q.ClientID)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var qoreResp QoreIDResponse
	if err := json.NewDecoder(resp.Body).Decode(&qoreResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s", qoreResp.Message)
	}

	return &qoreResp, nil
}