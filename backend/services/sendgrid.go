package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"onetimer-backend/config"
)

type SendGridService struct {
	apiKey    string
	fromEmail string
	fromName  string
}

type SendGridEmail struct {
	Personalizations []SendGridPersonalization `json:"personalizations"`
	From             SendGridContact           `json:"from"`
	Subject          string                    `json:"subject"`
	Content          []SendGridContent         `json:"content"`
}

type SendGridPersonalization struct {
	To []SendGridContact `json:"to"`
}

type SendGridContact struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type SendGridContent struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

func NewSendGridService(cfg *config.Config) *SendGridService {
	return &SendGridService{
		apiKey:    cfg.SendGridAPIKey,
		fromEmail: cfg.SendGridFromEmail,
		fromName:  cfg.SendGridFromName,
	}
}

func (s *SendGridService) SendOTP(email, otp string) error {
	if s.apiKey == "" || s.apiKey == "SG.placeholder_key_here" {
		return fmt.Errorf("SendGrid API key not configured")
	}

	emailData := SendGridEmail{
		Personalizations: []SendGridPersonalization{
			{
				To: []SendGridContact{
					{Email: email},
				},
			},
		},
		From: SendGridContact{
			Email: s.fromEmail,
			Name:  s.fromName,
		},
		Subject: "Your OneTime Survey Verification Code",
		Content: []SendGridContent{
			{
				Type:  "text/html",
				Value: s.getOTPTemplate(otp),
			},
		},
	}

	jsonData, err := json.Marshal(emailData)
	if err != nil {
		return fmt.Errorf("failed to marshal email data: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.sendgrid.com/v3/mail/send", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("SendGrid API error: %d", resp.StatusCode)
	}

	return nil
}

func (s *SendGridService) getOTPTemplate(otp string) string {
	return fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #013F5C;">Your Verification Code</h2>
			<p>Your OneTime Survey verification code is:</p>
			<div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
				<h1 style="color: #013F5C; font-size: 32px; margin: 0;">%s</h1>
			</div>
			<p>This code will expire in 5 minutes.</p>
			<p>If you didn't request this code, please ignore this email.</p>
		</div>
	`, otp)
}
