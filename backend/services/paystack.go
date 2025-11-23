package services

import (
	"bytes"
	"context"
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
	ctx := context.Background()
	req := PaystackInitRequest{
		Email:  email,
		Amount: amount,
		Ref:    reference,
	}

	data, err := json.Marshal(req)
	if err != nil {
		utils.LogError(ctx, "Failed to marshal Paystack request", err, "email", email)
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", fmt.Sprintf("%s/transaction/initialize", ps.baseURL), bytes.NewBuffer(data))
	if err != nil {
		utils.LogError(ctx, "Failed to create Paystack request", err, "email", email)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError(ctx, "Paystack API call failed", err, "email", email, "amount", amount)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError(ctx, "Failed to read Paystack response", err, "email", email)
		return nil, err
	}

	var result PaystackInitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError(ctx, "Failed to parse Paystack response", err, "email", email)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn(ctx, "⚠️ Paystack initialization failed", "message", result.Message, "email", email)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo(ctx, "✅ Paystack transaction initialized", "reference", result.Data.Reference, "email", email)
	return &result, nil
}

// VerifyTransaction verifies a payment transaction
func (ps *PaystackService) VerifyTransaction(reference string) (*PaystackVerifyResponse, error) {
	ctx := context.Background()
	httpReq, err := http.NewRequest("GET", fmt.Sprintf("%s/transaction/verify/%s", ps.baseURL, reference), nil)
	if err != nil {
		utils.LogError(ctx, "Failed to create Paystack verify request", err, "reference", reference)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError(ctx, "Paystack verify API call failed", err, "reference", reference)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError(ctx, "Failed to read Paystack verify response", err, "reference", reference)
		return nil, err
	}

	var result PaystackVerifyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError(ctx, "Failed to parse Paystack verify response", err, "reference", reference)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn(ctx, "⚠️ Paystack verification failed", "message", result.Message, "reference", reference)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo(ctx, "✅ Paystack transaction verified", "reference", reference, "status", result.Data.Status, "amount", result.Data.Amount)
	return &result, nil
}

// InitiateTransfer initiates a transfer/withdrawal
func (ps *PaystackService) InitiateTransfer(amount int, recipientID int, reason string, reference string) (*TransferInitResponse, error) {
	ctx := context.Background()
	req := TransferInitRequest{
		Source:    "balance",
		Amount:    amount,
		Recipient: recipientID,
		Reason:    reason,
		Reference: reference,
	}

	data, err := json.Marshal(req)
	if err != nil {
		utils.LogError(ctx, "Failed to marshal transfer request", err, "amount", amount, "recipient_id", recipientID)
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", fmt.Sprintf("%s/transfer", ps.baseURL), bytes.NewBuffer(data))
	if err != nil {
		utils.LogError(ctx, "Failed to create transfer request", err, "amount", amount, "recipient_id", recipientID)
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", ps.secretKey))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.LogError(ctx, "Paystack transfer API call failed", err, "amount", amount, "recipient_id", recipientID)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.LogError(ctx, "Failed to read transfer response", err, "amount", amount)
		return nil, err
	}

	var result TransferInitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		utils.LogError(ctx, "Failed to parse transfer response", err, "amount", amount, "recipient_id", recipientID)
		return nil, err
	}

	if !result.Status {
		utils.LogWarn(ctx, "⚠️ Paystack transfer failed", "message", result.Message, "amount", amount, "recipient_id", recipientID)
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	utils.LogInfo(ctx, "✅ Paystack transfer initiated", "reference", result.Data.Reference, "amount", amount, "recipient_id", recipientID)
	return &result, nil
}
