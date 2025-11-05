package services

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"onetimer-backend/config"
	"onetimer-backend/utils"
	"strconv"
)

type EmailService struct {
	config *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	// Log email service initialization
	if cfg.SMTPHost != "" && cfg.SMTPUser != "" {
		log.Println("✅ Email service initialized (SMTP configured)")
	} else {
		log.Println("⚠️ Email service initialized (SMTP not configured - emails will be logged only)")
	}
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

// SendWaitlistConfirmation sends email to waitlist subscribers
func (e *EmailService) SendWaitlistConfirmation(email string) error {
	subject := "🎉 You're on the Waitlist!"
	body := e.getWaitlistTemplate(email)
	return e.sendEmail(email, subject, body)
}

// SendSurveyCompletionNotification sends email when survey is completed
func (e *EmailService) SendSurveyCompletionNotification(email, name, surveyTitle string, reward int) error {
	subject := "Survey Completed - Earnings Added!"
	body := e.getSurveyCompletionTemplate(name, surveyTitle, reward)
	return e.sendEmail(email, subject, body)
}

// SendPaymentConfirmation sends email when payment is received
func (e *EmailService) SendPaymentConfirmation(email, name string, amount int, credits int) error {
	subject := "Payment Confirmed - Credits Added!"
	body := e.getPaymentConfirmationTemplate(name, amount, credits)
	return e.sendEmail(email, subject, body)
}

// SendWithdrawalRequest sends email when withdrawal is requested
func (e *EmailService) SendWithdrawalRequest(email, name string, amount int) error {
	subject := "Withdrawal Request Received"
	body := e.getWithdrawalRequestTemplate(name, amount)
	return e.sendEmail(email, subject, body)
}

// SendNewSurveyNotification sends email when new surveys are available
func (e *EmailService) SendNewSurveyNotification(email, name string, surveyCount int) error {
	subject := fmt.Sprintf("🔔 %d New Survey%s Available!", surveyCount, func() string {
		if surveyCount > 1 {
			return "s"
		}
		return ""
	}())
	body := e.getNewSurveyTemplate(name, surveyCount)
	return e.sendEmail(email, subject, body)
}

func (e *EmailService) sendEmail(to, subject, body string) error {
	// Check if config is nil or SMTP not configured
	if e.config == nil || e.config.SMTPHost == "" {
		// Log email instead of sending (development mode)
		utils.LogInfo("📧 [EMAIL NOT SENT - SMTP not configured] To: %s, Subject: %s", to, subject)
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
		utils.LogError("Failed to send email to %s: %v", to, err)
		return err
	}

	utils.LogInfo("✅ Email sent successfully to %s: %s", to, subject)
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