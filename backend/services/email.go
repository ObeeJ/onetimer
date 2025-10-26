package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"onetimer-backend/config"
	"strconv"
)

type EmailService struct {
	config *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{config: cfg}
}

func (e *EmailService) SendWelcomeEmail(email, name string) error {
	subject := "Welcome to Onetime Survey Platform!"
	body := e.getWelcomeTemplate(name)
	return e.sendEmail(email, subject, body)
}

func (e *EmailService) SendOTP(email, otp string) error {
	subject := "Your Onetime Survey Verification Code"
	body := e.getOTPTemplate(otp)
	return e.sendEmail(email, subject, body)
}

func (e *EmailService) SendKYCApproval(email, name string) error {
	subject := "KYC Verification Approved - Start Earning!"
	body := e.getKYCApprovalTemplate(name)
	return e.sendEmail(email, subject, body)
}

func (e *EmailService) SendPayoutNotification(email, name string, amount int) error {
	subject := "Payout Processed Successfully"
	body := e.getPayoutTemplate(name, amount)
	return e.sendEmail(email, subject, body)
}

func (e *EmailService) sendEmail(to, subject, body string) error {
	if e.config.SMTPHost == "" {
		return nil // Skip if SMTP not configured
	}

	from := e.config.SMTPUser
	password := e.config.SMTPPass
	host := e.config.SMTPHost
	port := e.config.SMTPPort

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s", from, to, subject, body)

	auth := smtp.PlainAuth("", from, password, host)
	return smtp.SendMail(host+":"+port, auth, from, []string{to}, []byte(msg))
}

func (e *EmailService) getWelcomeTemplate(name string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #013F5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Onetime Survey!</h1>
        </div>
        <div class="content">
            <h2>Hi {{.Name}},</h2>
            <p>Welcome to Onetime Survey Platform! We're excited to have you join our community.</p>
            <p>You can now:</p>
            <ul>
                <li>Complete surveys and earn money</li>
                <li>Refer friends and earn bonuses</li>
                <li>Track your earnings in real-time</li>
                <li>Withdraw your earnings to your bank account</li>
            </ul>
            <p>Get started by completing your profile and taking your first survey!</p>
            <a href="https://onetimer-frontend.onrender.com/filler" class="button">Start Earning Now</a>
            <p>Best regards,<br>The Onetime Survey Team</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("welcome").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{"Name": name})
	return buf.String()
}

func (e *EmailService) getOTPTemplate(otp string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp { font-size: 32px; font-weight: bold; color: #013F5C; text-align: center; padding: 20px; background: white; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verification Code</h1>
        </div>
        <div class="content">
            <p>Your Onetime Survey verification code is:</p>
            <div class="otp">{{.OTP}}</div>
            <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("otp").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{"OTP": otp})
	return buf.String()
}

func (e *EmailService) getKYCApprovalTemplate(name string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 KYC Approved!</h1>
        </div>
        <div class="content">
            <h2>Congratulations {{.Name}}!</h2>
            <p>Your KYC verification has been approved. You can now:</p>
            <ul>
                <li>Complete surveys and earn money</li>
                <li>Withdraw your earnings to your bank account</li>
                <li>Access premium surveys with higher rewards</li>
            </ul>
            <a href="https://onetimer-frontend.onrender.com/filler/surveys" class="button">Start Taking Surveys</a>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("kyc").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{"Name": name})
	return buf.String()
}

func (e *EmailService) getPayoutTemplate(name string, amount int) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Payout Processed</h1>
        </div>
        <div class="content">
            <h2>Hi {{.Name}},</h2>
            <p>Great news! Your payout has been processed successfully.</p>
            <div class="amount">₦{{.Amount}}</div>
            <p>The money should reflect in your bank account within 1-3 business days.</p>
            <p>Keep taking surveys to earn more!</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("payout").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{"Name": name, "Amount": strconv.Itoa(amount)})
	return buf.String()
}