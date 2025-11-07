package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"onetimer-backend/utils"
	"time"
)

type PaystackService struct {
	secretKey string
	baseURL   string
}

type PaystackInitRequest struct {
	Email  string `json:"email"`
	Amount int    `json:"amount"` // in kobo (e.g., 50000 = ₦500)
	Ref    string `json:"reference,omitempty"`
}

type PaystackInitResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		AuthorizationURL string `json:"authorization_url"`
		AccessCode       string `json:"access_code"`
		Reference        string `json:"reference"`
	} `json:"data"`
}

type PaystackVerifyResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Reference     string `json:"reference"`
		Amount        int    `json:"amount"`
		Status        string `json:"status"`
		PaidAt        string `json:"paid_at"`
		Authorization struct {
			AuthorizationCode string `json:"authorization_code"`
			Bin               string `json:"bin"`
			Last4             string `json:"last4"`
			ExpMonth          string `json:"exp_month"`
			ExpYear           string `json:"exp_year"`
			Brand             string `json:"brand"`
		} `json:"authorization"`
	} `json:"data"`
}

type TransferInitRequest struct {
	Source    string `json:"source"` // "balance"
	Reason    string `json:"reason,omitempty"`
	Amount    int    `json:"amount"`
	Recipient int    `json:"recipient"`
	Reference string `json:"reference,omitempty"`
}

type TransferInitResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Reference    string `json:"reference"`
		TransferCode string `json:"transfer_code"`
		Status       string `json:"status"`
	} `json:"data"`
}

func NewPaystackService(secretKey string) *PaystackService {
	return &PaystackService{
		secretKey: secretKey,
		baseURL:   "https://api.paystack.co",
	}
}

// InitializeTransaction initializes a payment transaction
func (ps *PaystackService) InitializeTransaction(email string, amount int, reference string) (*PaystackInitResponse, error) {
	req := PaystackInitRequest{
		Email:  email,
		Amount: amount,
		Ref:    reference,
	}

	data, err := json.Marshal(req)
	if err != nil {
		utils.LogError("Failed to marshal Paystack request: %v", err)
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", fmt.Sprintf("%s/transaction/initialize", ps.baseURL), bytes.NewBuffer(data))
	if err != nil {
		utils.LogError("Failed to create Paystack request: %v", err)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError("Paystack API call failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError("Failed to read Paystack response: %v", err)
		return nil, err
	}

	var result PaystackInitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError("Failed to parse Paystack response: %v", err)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn("Paystack initialization failed: %s", result.Message)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo("Paystack transaction initialized: reference=%s", result.Data.Reference)
	return &result, nil
}

// VerifyTransaction verifies a payment transaction
func (ps *PaystackService) VerifyTransaction(reference string) (*PaystackVerifyResponse, error) {
	httpReq, err := http.NewRequest("GET", fmt.Sprintf("%s/transaction/verify/%s", ps.baseURL, reference), nil)
	if err != nil {
		utils.LogError("Failed to create Paystack verify request: %v", err)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError("Paystack verify API call failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError("Failed to read Paystack verify response: %v", err)
		return nil, err
	}

	var result PaystackVerifyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError("Failed to parse Paystack verify response: %v", err)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn("Paystack verification failed: %s", result.Message)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo("Paystack transaction verified: reference=%s, status=%s, amount=%d", reference, result.Data.Status, result.Data.Amount)
	return &result, nil
}

// InitiateTransfer initiates a transfer/withdrawal
func (ps *PaystackService) InitiateTransfer(amount int, recipientID int, reason string, reference string) (*TransferInitResponse, error) {
	req := TransferInitRequest{
		Source:    "balance",
		Amount:    amount,
		Recipient: recipientID,
		Reason:    reason,
		Reference: reference,
	}

	data, err := json.Marshal(req)
	if err != nil {
		utils.LogError("Failed to marshal transfer request: %v", err)
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", fmt.Sprintf("%s/transfer", ps.baseURL), bytes.NewBuffer(data))
	if err != nil {
		utils.LogError("Failed to create transfer request: %v", err)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError("Paystack transfer API call failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError("Failed to read transfer response: %v", err)
		return nil, err
	}

	var result TransferInitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError("Failed to parse transfer response: %v", err)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn("Paystack transfer failed: %s", result.Message)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo("Paystack transfer initiated: reference=%s, amount=%d", result.Data.Reference, amount)
	return &result, nil
}
