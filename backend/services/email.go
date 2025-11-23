package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"net/smtp"
	"onetimer-backend/config"
	"onetimer-backend/utils"
	"strconv"
)

type EmailService struct {
	config       *config.Config
	sendGrid     *SendGridService
}

func NewEmailService(cfg *config.Config) *EmailService {
	sendGrid := NewSendGridService(cfg)

	// Log email service initialization
	if cfg.SendGridAPIKey != "" && cfg.SendGridAPIKey != "SG.placeholder_key_here" {
		utils.LogInfoSimple("✅ Email service initialized", "provider", "SendGrid")
	} else if cfg.SMTPHost != "" && cfg.SMTPUser != "" {
		utils.LogInfoSimple("✅ Email service initialized", "provider", "SMTP", "host", cfg.SMTPHost)
	} else {
		utils.LogWarnSimple("⚠️ Email service initialized", "provider", "none", "mode", "log_only")
	}

	return &EmailService{
		config:   cfg,
		sendGrid: sendGrid,
	}
}

func (e *EmailService) SendWelcomeEmail(email, name string) error {
	ctx := context.Background()
	defer func() {
		if r := recover(); r != nil {
			utils.LogErrorSimple("SendWelcomeEmail panicked", "email", email, "panic", r)
		}
	}()

	subject := "Welcome to Onetime Survey Platform!"
	body := e.getWelcomeTemplate(name)
	err := e.sendSMTP(ctx, email, subject, body)

	if err != nil {
		utils.LogError(ctx, "Failed to send welcome email", err, "email", email, "name", name)
	}
	return err
}

func (e *EmailService) SendOTP(email, otp string) error {
	ctx := context.Background()
	defer func() {
		if r := recover(); r != nil {
			utils.LogErrorSimple("SendOTP panicked", "email", email, "panic", r)
		}
	}()

	// Try SendGrid first
	if e.config.SendGridAPIKey != "" && e.config.SendGridAPIKey != "SG.placeholder_key_here" {
		err := e.sendGrid.SendOTP(email, otp)
		if err == nil {
			utils.LogInfo(ctx, "✅ Email sent successfully via SendGrid", "email", email, "type", "OTP")
			return nil
		}
		utils.LogWarn(ctx, "SendGrid failed, falling back to SMTP", "email", email, "error", err.Error())
	}

	// Fallback to SMTP
	if e.config.SMTPHost != "" && e.config.SMTPUser != "" {
		subject := "Your Onetime Survey Verification Code"
		body := e.getOTPTemplate(otp)
		err := e.sendSMTP(ctx, email, subject, body)
		if err == nil {
			utils.LogInfo(ctx, "✅ Email sent successfully via SMTP", "email", email, "type", "OTP")
			return nil
		}
		utils.LogError(ctx, "Failed to send OTP email", err, "email", email)
		return err
	}

	// No email provider configured
	utils.LogWarn(ctx, "No email provider configured", "email", email, "type", "OTP")
	return fmt.Errorf("no email provider configured")
}

func (e *EmailService) SendKYCApproval(email, name string) error {
	ctx := context.Background()
	subject := "KYC Verification Approved - Start Earning!"
	body := e.getKYCApprovalTemplate(name)
	return e.sendSMTP(ctx, email, subject, body)
}

func (e *EmailService) SendPayoutNotification(email, name string, amount int) error {
	ctx := context.Background()
	subject := "Payout Processed Successfully"
	body := e.getPayoutTemplate(name, amount)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendWaitlistConfirmation sends email to waitlist subscribers
func (e *EmailService) SendWaitlistConfirmation(email string) error {
	ctx := context.Background()
	subject := "🎉 You're on the Waitlist!"
	body := e.getWaitlistTemplate(email)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendSurveyCompletionNotification sends email when survey is completed
func (e *EmailService) SendSurveyCompletionNotification(email, name, surveyTitle string, reward int) error {
	ctx := context.Background()
	subject := "Survey Completed - Earnings Added!"
	body := e.getSurveyCompletionTemplate(name, surveyTitle, reward)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendPaymentConfirmation sends email when payment is received
func (e *EmailService) SendPaymentConfirmation(email, name string, amount int, credits int) error {
	ctx := context.Background()
	subject := "Payment Confirmed - Credits Added!"
	body := e.getPaymentConfirmationTemplate(name, amount, credits)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendWithdrawalRequest sends email when withdrawal is requested
func (e *EmailService) SendWithdrawalRequest(email, name string, amount int) error {
	ctx := context.Background()
	subject := "Withdrawal Request Received"
	body := e.getWithdrawalRequestTemplate(name, amount)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendNewSurveyNotification sends email when new surveys are available
func (e *EmailService) SendNewSurveyNotification(email, name string, surveyCount int) error {
	ctx := context.Background()
	subject := fmt.Sprintf("🔔 %d New Survey%s Available!", surveyCount, func() string {
		if surveyCount > 1 {
			return "s"
		}
		return ""
	}())
	body := e.getNewSurveyTemplate(name, surveyCount)
	return e.sendSMTP(ctx, email, subject, body)
}

// SendPasswordReset sends password reset email with reset link
func (e *EmailService) SendPasswordReset(email, resetToken string) error {
	ctx := context.Background()
	subject := "Reset Your Password - Onetime Survey"
	body := e.getPasswordResetTemplate(email, resetToken)
	return e.sendSMTP(ctx, email, subject, body)
}

func (e *EmailService) sendSMTP(ctx context.Context, to, subject, body string) error {
	defer func() {
		if r := recover(); r != nil {
			utils.LogErrorSimple("sendSMTP panicked", "to", to, "subject", subject, "panic", r)
		}
	}()

	// Check if config is nil or SMTP not configured
	if e.config == nil || e.config.SMTPHost == "" {
		// Log email instead of sending (development mode)
		utils.LogInfo(ctx, "📧 [EMAIL NOT SENT - SMTP not configured]", "to", to, "subject", subject)
		return nil
	}

	from := e.config.SMTPUser
	password := e.config.SMTPPass
	host := e.config.SMTPHost
	port := e.config.SMTPPort

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s", from, to, subject, body)

	auth := smtp.PlainAuth("", from, password, host)
	err := smtp.SendMail(host+":"+port, auth, from, []string{to}, []byte(msg))

	if err != nil {
		utils.LogError(ctx, "Failed to send email", err, "to", to, "subject", subject, "host", host)
		return err
	}

	utils.LogInfo(ctx, "✅ Email sent successfully", "to", to, "subject", subject)
	return nil
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

func (e *EmailService) getWaitlistTemplate(email string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .highlight { color: #013F5C; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to the Waitlist!</h1>
        </div>
        <div class="content">
            <p>Thank you for joining the Onetime Survey waitlist!</p>
            <p>You're one of the first to know when we launch. We'll send you an email at <span class="highlight">{{.Email}}</span> when:</p>
            <ul>
                <li>We're ready to go live</li>
                <li>Early access opportunities become available</li>
                <li>Special launch bonuses are announced</li>
            </ul>
            <p>Get ready to start earning money by completing surveys!</p>
            <p>Best regards,<br>The Onetime Survey Team</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("waitlist").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{"Email": email})
	return buf.String()
}

func (e *EmailService) getSurveyCompletionTemplate(name, surveyTitle string, reward int) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .reward { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; padding: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Survey Completed!</h1>
        </div>
        <div class="content">
            <h2>Great job, {{.Name}}!</h2>
            <p>You've successfully completed the survey: <strong>{{.SurveyTitle}}</strong></p>
            <div class="reward">+₦{{.Reward}} earned!</div>
            <p>Your earnings have been added to your account and will be available for withdrawal once approved.</p>
            <p>Keep completing surveys to maximize your earnings!</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("survey_completion").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Name":        name,
		"SurveyTitle": surveyTitle,
		"Reward":      strconv.Itoa(reward),
	})
	return buf.String()
}

func (e *EmailService) getPaymentConfirmationTemplate(name string, amount, credits int) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credits { font-size: 32px; font-weight: bold; color: #013F5C; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Payment Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Hi {{.Name}},</h2>
            <p>Your payment of <strong>₦{{.Amount}}</strong> has been confirmed!</p>
            <div class="credits">{{.Credits}} Credits Added</div>
            <p>You can now use these credits to create surveys and reach your target audience.</p>
            <p>Thank you for using Onetime Survey!</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("payment_confirmation").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Name":    name,
		"Amount":  strconv.Itoa(amount),
		"Credits": strconv.Itoa(credits),
	})
	return buf.String()
}

func (e *EmailService) getWithdrawalRequestTemplate(name string, amount int) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; font-weight: bold; color: #013F5C; text-align: center; padding: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Withdrawal Request Received</h1>
        </div>
        <div class="content">
            <h2>Hi {{.Name}},</h2>
            <p>We've received your withdrawal request:</p>
            <div class="amount">₦{{.Amount}}</div>
            <p>Your request is being processed and will be completed within 1-3 business days.</p>
            <p>You'll receive another email once the payout is complete.</p>
            <p>Thank you for using Onetime Survey!</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("withdrawal_request").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Name":   name,
		"Amount": strconv.Itoa(amount),
	})
	return buf.String()
}

func (e *EmailService) getNewSurveyTemplate(name string, surveyCount int) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #013F5C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        .count { font-size: 36px; font-weight: bold; color: #013F5C; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Surveys Available!</h1>
        </div>
        <div class="content">
            <h2>Hi {{.Name}},</h2>
            <p>Great news! <span class="count">{{.Count}}</span> new survey(s) matching your profile are now available.</p>
            <p>Don't miss out on the opportunity to earn more money!</p>
            <a href="https://onetimer-frontend.onrender.com/filler/surveys" class="button">View Available Surveys</a>
            <p>The early bird gets the worm - surveys fill up fast!</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("new_survey").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Name":  name,
		"Count": strconv.Itoa(surveyCount),
	})
	return buf.String()
}

func (e *EmailService) getPasswordResetTemplate(email, resetToken string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #013F5C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #013F5C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
            <p>We received a request to reset the password for your Onetime Survey account ({{.Email}}).</p>
            <p>Click the button below to reset your password:</p>
            <a href="http://localhost:3000/creator/reset-password?token={{.Token}}" class="button">Reset Password</a>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link will expire in 15 minutes</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 3px;">http://localhost:3000/creator/reset-password?token={{.Token}}</p>
            <p>Best regards,<br>The Onetime Survey Team</p>
        </div>
    </div>
</body>
</html>`

	t, _ := template.New("password_reset").Parse(tmpl)
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Email": email,
		"Token": resetToken,
	})
	return buf.String()
}
