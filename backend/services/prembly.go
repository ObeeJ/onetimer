package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PremblyService struct {
	APIKey  string
	BaseURL string
}

type PremblyNINRequest struct {
	Number string `json:"number"`
}

type PremblyResponse struct {
	Status bool `json:"status"`
	Data   struct {
		FirstName   string `json:"firstname"`
		LastName    string `json:"lastname"`
		Phone       string `json:"phone"`
		DateOfBirth string `json:"birthdate"`
		Gender      string `json:"gender"`
	} `json:"data"`
	Message string `json:"message"`
}

func NewPremblyService(apiKey string) *PremblyService {
	return &PremblyService{
		APIKey:  apiKey,
		BaseURL: "https://api.prembly.com/identitypass/verification",
	}
}

func (p *PremblyService) VerifyNIN(nin string) (*PremblyResponse, error) {
	payload, _ := json.Marshal(PremblyNINRequest{Number: nin})

	req, err := http.NewRequest("POST", p.BaseURL+"/nin", bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", p.APIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result PremblyResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result.Status {
		return nil, fmt.Errorf("verification failed: %s", result.Message)
	}

	return &result, nil
}