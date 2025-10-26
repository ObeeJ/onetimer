package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PaystackService struct {
	secretKey string
}

type PaystackResponse struct {
	Status  bool        `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type PaystackInitResponse struct {
	AuthorizationURL string `json:"authorization_url"`
	AccessCode       string `json:"access_code"`
	Reference        string `json:"reference"`
}

type PaystackVerifyResponse struct {
	Amount   int    `json:"amount"`
	Status   string `json:"status"`
	Reference string `json:"reference"`
	Customer struct {
		Email string `json:"email"`
	} `json:"customer"`
}

func NewPaystackService(secretKey string) *PaystackService {
	return &PaystackService{secretKey: secretKey}
}

func (p *PaystackService) InitializePayment(email string, amount int, reference string) (*PaystackInitResponse, error) {
	url := "https://api.paystack.co/transaction/initialize"
	
	payload := map[string]interface{}{
		"email":     email,
		"amount":    amount * 100, // Convert to kobo
		"reference": reference,
		"currency":  "NGN",
	}
	
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+p.secretKey)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result struct {
		Status bool `json:"status"`
		Data   PaystackInitResponse `json:"data"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	if !result.Status {
		return nil, fmt.Errorf("payment initialization failed")
	}
	
	return &result.Data, nil
}

func (p *PaystackService) VerifyTransaction(reference string) (*PaystackVerifyResponse, error) {
	url := fmt.Sprintf("https://api.paystack.co/transaction/verify/%s", reference)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+p.secretKey)
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result struct {
		Status bool `json:"status"`
		Data   PaystackVerifyResponse `json:"data"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	if !result.Status {
		return nil, fmt.Errorf("transaction verification failed")
	}
	
	return &result.Data, nil
}

func (p *PaystackService) CreateTransferRecipient(accountNumber, bankCode, name string) (string, error) {
	url := "https://api.paystack.co/transferrecipient"
	
	payload := map[string]interface{}{
		"type":           "nuban",
		"name":           name,
		"account_number": accountNumber,
		"bank_code":      bankCode,
		"currency":       "NGN",
	}
	
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return "", err
	}
	
	req.Header.Set("Authorization", "Bearer "+p.secretKey)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	var result struct {
		Status bool `json:"status"`
		Data   struct {
			RecipientCode string `json:"recipient_code"`
		} `json:"data"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	
	if !result.Status {
		return "", fmt.Errorf("recipient creation failed")
	}
	
	return result.Data.RecipientCode, nil
}

func (p *PaystackService) InitiateTransfer(recipientCode string, amount int, reference string) error {
	url := "https://api.paystack.co/transfer"
	
	payload := map[string]interface{}{
		"source":    "balance",
		"amount":    amount * 100, // Convert to kobo
		"recipient": recipientCode,
		"reason":    "Onetime Survey Payout",
		"reference": reference,
	}
	
	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}
	
	req.Header.Set("Authorization", "Bearer "+p.secretKey)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	var result PaystackResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}
	
	if !result.Status {
		return fmt.Errorf("transfer failed: %s", result.Message)
	}
	
	return nil
}