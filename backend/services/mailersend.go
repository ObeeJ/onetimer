package services

import (
	"context"
	"fmt"
	"onetimer-backend/config"
	"onetimer-backend/observability"
	"onetimer-backend/utils"
	"strconv"
	"time"

	"github.com/mailersend/mailersend-go"
)

type MailerSendService struct {
	client *mailersend.Mailersend
	config *config.Config
}

func NewMailerSendService(cfg *config.Config) *MailerSendService {
	if cfg.MailerSendAPIKey == "" {
		utils.LogWarnSimple("⚠️ MailerSend API key not configured")
		return nil
	}

	ms := mailersend.NewMailersend(cfg.MailerSendAPIKey)
	utils.LogInfoSimple("✅ MailerSend service initialized", "provider", "MailerSend")

	return &MailerSendService{
		client: ms,
		config: cfg,
	}
}

// SendOTP sends an OTP code via email with Sentry instrumentation
func (m *MailerSendService) SendOTP(ctx context.Context, email, otp string) error {
	// Start Sentry span for external API call
	span := observability.StartExternalAPISpan(ctx, "POST", "https://api.mailersend.com/v1/email")
	defer span.Finish()

	// Add business context
	observability.SetBusinessContext(ctx, "email", map[string]interface{}{
		"type":      "otp",
		"recipient": email,
	})

	message := m.client.Email.NewMessage()

	from := mailersend.From{
		Name:  "OneTime Survey",
		Email: m.config.EmailFrom,
	}

	recipients := []mailersend.Recipient{
		{
			Email: email,
		},
	}

	subject := "Your OneTime Survey Verification Code"
	html := m.getOTPHTMLTemplate(otp)
	text := m.getOTPTextTemplate(otp)

	message.SetFrom(from)
	message.SetRecipients(recipients)
	message.SetSubject(subject)
	message.SetHTML(html)
	message.SetText(text)
	message.SetTags([]string{"otp", "verification"})

	// Send email with timeout
	sendCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := m.client.Email.Send(sendCtx, message)
	if err != nil {
		span.SetTag("error", "true")
		span.SetData("error_message", err.Error())
		utils.LogError(ctx, "❌ MailerSend OTP send failed", err, "email", email)
		return fmt.Errorf("failed to send OTP via MailerSend: %w", err)
	}

	messageID := res.Header.Get("X-Message-Id")
	span.SetTag("message_id", messageID)
	span.SetTag("status_code", strconv.Itoa(res.StatusCode))

	utils.LogInfo(ctx, "✅ OTP email sent via MailerSend",
		"email", email,
		"message_id", messageID,
		"status", res.StatusCode)

	return nil
}

// SendWelcomeEmail sends a welcome email to new users
func (m *MailerSendService) SendWelcomeEmail(ctx context.Context, email, name string) error {
	span := observability.StartExternalAPISpan(ctx, "POST", "https://api.mailersend.com/v1/email")
	defer span.Finish()

	observability.SetBusinessContext(ctx, "email", map[string]interface{}{
		"type":      "welcome",
		"recipient": email,
		"name":      name,
	})

	message := m.client.Email.NewMessage()

	from := mailersend.From{
		Name:  "OneTime Survey Team",
		Email: m.config.EmailFrom,
	}

	recipients := []mailersend.Recipient{
		{
			Name:  name,
			Email: email,
		},
	}

	subject := "Welcome to OneTime Survey Platform! 🎉"
	html := m.getWelcomeHTMLTemplate(name)
	text := m.getWelcomeTextTemplate(name)

	message.SetFrom(from)
	message.SetRecipients(recipients)
	message.SetSubject(subject)
	message.SetHTML(html)
	message.SetText(text)
	message.SetTags([]string{"welcome", "onboarding"})

	sendCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := m.client.Email.Send(sendCtx, message)
	if err != nil {
		span.SetTag("error", "true")
		utils.LogError(ctx, "❌ MailerSend welcome email failed", err, "email", email)
		return err
	}

	messageID := res.Header.Get("X-Message-Id")
	span.SetTag("message_id", messageID)
	utils.LogInfo(ctx, "✅ Welcome email sent via MailerSend", "email", email, "message_id", messageID)

	return nil
}

// SendPasswordResetEmail sends a password reset link
func (m *MailerSendService) SendPasswordResetEmail(ctx context.Context, email, name, resetToken string) error {
	span := observability.StartExternalAPISpan(ctx, "POST", "https://api.mailersend.com/v1/email")
	defer span.Finish()

	message := m.client.Email.NewMessage()

	from := mailersend.From{
		Name:  "OneTime Survey Security",
		Email: m.config.EmailFrom,
	}

	recipients := []mailersend.Recipient{
		{
			Name:  name,
			Email: email,
		},
	}

	resetLink := fmt.Sprintf("https://www.onetimesurvey.xyz/auth/reset-password?token=%s", resetToken)
	subject := "Password Reset Request"
	html := m.getPasswordResetHTMLTemplate(name, resetLink)
	text := m.getPasswordResetTextTemplate(name, resetLink)

	message.SetFrom(from)
	message.SetRecipients(recipients)
	message.SetSubject(subject)
	message.SetHTML(html)
	message.SetText(text)
	message.SetTags([]string{"password-reset", "security"})

	sendCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := m.client.Email.Send(sendCtx, message)
	if err != nil {
		span.SetTag("error", "true")
		utils.LogError(ctx, "❌ MailerSend password reset failed", err, "email", email)
		return err
	}

	messageID := res.Header.Get("X-Message-Id")
	span.SetTag("message_id", messageID)
	utils.LogInfo(ctx, "✅ Password reset email sent via MailerSend", "email", email, "message_id", messageID)

	return nil
}

// SendPayoutNotification sends payout confirmation
func (m *MailerSendService) SendPayoutNotification(ctx context.Context, email, name string, amount int) error {
	span := observability.StartExternalAPISpan(ctx, "POST", "https://api.mailersend.com/v1/email")
	defer span.Finish()

	observability.SetBusinessContext(ctx, "email", map[string]interface{}{
		"type":      "payout",
		"recipient": email,
		"amount":    amount,
	})

	message := m.client.Email.NewMessage()

	from := mailersend.From{
		Name:  "OneTime Survey Payouts",
		Email: m.config.EmailFrom,
	}

	recipients := []mailersend.Recipient{
		{
			Name:  name,
			Email: email,
		},
	}

	subject := "Payout Processed Successfully ₦" + fmt.Sprintf("%d", amount)
	html := m.getPayoutHTMLTemplate(name, amount)
	text := m.getPayoutTextTemplate(name, amount)

	message.SetFrom(from)
	message.SetRecipients(recipients)
	message.SetSubject(subject)
	message.SetHTML(html)
	message.SetText(text)
	message.SetTags([]string{"payout", "transaction"})

	sendCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	res, err := m.client.Email.Send(sendCtx, message)
	if err != nil {
		span.SetTag("error", "true")
		utils.LogError(ctx, "❌ MailerSend payout notification failed", err, "email", email, "amount", amount)
		return err
	}

	messageID := res.Header.Get("X-Message-Id")
	span.SetTag("message_id", messageID)
	utils.LogInfo(ctx, "✅ Payout notification sent via MailerSend", "email", email, "message_id", messageID, "amount", amount)

	return nil
}

// HTML Templates

func (m *MailerSendService) getOTPHTMLTemplate(otp string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #013F5C; color: white; padding: 20px; text-align: center; }
		.content { background: #f9f9f9; padding: 30px; }
		.otp-box { background: white; border: 2px solid #013F5C; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
		.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>OneTime Survey</h1>
		</div>
		<div class="content">
			<h2>Your Verification Code</h2>
			<p>Use the code below to verify your account:</p>
			<div class="otp-box">%s</div>
			<p><strong>This code will expire in 5 minutes.</strong></p>
			<p>If you didn't request this code, please ignore this email.</p>
		</div>
		<div class="footer">
			<p>© 2024 OneTime Survey. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`, otp)
}

func (m *MailerSendService) getOTPTextTemplate(otp string) string {
	return fmt.Sprintf(`
OneTime Survey - Verification Code

Your verification code is: %s

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

© 2024 OneTime Survey
`, otp)
}

func (m *MailerSendService) getWelcomeHTMLTemplate(name string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #013F5C; color: white; padding: 30px; text-align: center; }
		.content { padding: 30px; background: white; }
		.button { display: inline-block; padding: 12px 30px; background: #013F5C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
		.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Welcome to OneTime Survey! 🎉</h1>
		</div>
		<div class="content">
			<h2>Hi %s,</h2>
			<p>Thank you for joining OneTime Survey! We're excited to have you on board.</p>
			<p>You can now:</p>
			<ul>
				<li>Complete surveys and earn rewards</li>
				<li>Create your own surveys</li>
				<li>Track your earnings</li>
			</ul>
			<a href="https://www.onetimesurvey.xyz" class="button">Get Started</a>
		</div>
		<div class="footer">
			<p>© 2024 OneTime Survey. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`, name)
}

func (m *MailerSendService) getWelcomeTextTemplate(name string) string {
	return fmt.Sprintf(`
Welcome to OneTime Survey!

Hi %s,

Thank you for joining OneTime Survey! We're excited to have you on board.

You can now:
- Complete surveys and earn rewards
- Create your own surveys
- Track your earnings

Get started: https://www.onetimesurvey.xyz

© 2024 OneTime Survey
`, name)
}

func (m *MailerSendService) getPasswordResetHTMLTemplate(name, resetLink string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #013F5C; color: white; padding: 20px; text-align: center; }
		.content { padding: 30px; background: white; }
		.button { display: inline-block; padding: 12px 30px; background: #013F5C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
		.warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
		.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Password Reset Request</h1>
		</div>
		<div class="content">
			<h2>Hi %s,</h2>
			<p>We received a request to reset your password. Click the button below to create a new password:</p>
			<a href="%s" class="button">Reset Password</a>
			<p><strong>This link will expire in 1 hour.</strong></p>
			<div class="warning">
				<strong>Security Note:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
			</div>
		</div>
		<div class="footer">
			<p>© 2024 OneTime Survey. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`, name, resetLink)
}

func (m *MailerSendService) getPasswordResetTextTemplate(name, resetLink string) string {
	return fmt.Sprintf(`
Password Reset Request

Hi %s,

We received a request to reset your password. Use the link below to create a new password:

%s

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

© 2024 OneTime Survey
`, name, resetLink)
}

func (m *MailerSendService) getPayoutHTMLTemplate(name string, amount int) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #28a745; color: white; padding: 30px; text-align: center; }
		.content { padding: 30px; background: white; }
		.amount-box { background: #f0f9f4; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; }
		.amount { font-size: 36px; font-weight: bold; color: #28a745; }
		.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Payout Successful! ✓</h1>
		</div>
		<div class="content">
			<h2>Hi %s,</h2>
			<p>Great news! Your payout has been processed successfully.</p>
			<div class="amount-box">
				<div class="amount">₦%d</div>
				<p>has been sent to your account</p>
			</div>
			<p>The funds should arrive in your account within 1-3 business days.</p>
			<p>Thank you for being a valued member of OneTime Survey!</p>
		</div>
		<div class="footer">
			<p>© 2024 OneTime Survey. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`, name, amount)
}

func (m *MailerSendService) getPayoutTextTemplate(name string, amount int) string {
	return fmt.Sprintf(`
Payout Successful!

Hi %s,

Great news! Your payout has been processed successfully.

Amount: ₦%d

The funds should arrive in your account within 1-3 business days.

Thank you for being a valued member of OneTime Survey!

© 2024 OneTime Survey
`, name, amount)
}
