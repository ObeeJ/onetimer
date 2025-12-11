package observability

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/getsentry/sentry-go"
)

type SentryConfig struct {
	DSN         string
	Environment string
	Release     string
	ServerName  string
	Debug       bool
}

var sensitiveFields = []string{
	"password", "token", "secret", "api_key", "apikey", "authorization",
	"credit_card", "cvv", "ssn", "jwt", "bearer", "smtp_pass", "aws_secret",
}

func InitSentry(cfg SentryConfig) error {
	if cfg.DSN == "" {
		log.Println("Sentry DSN not provided, skipping initialization")
		return nil
	}

	sampleRate := getSampleRate(cfg.Environment)
	tracesSampleRate := getTracesSampleRate(cfg.Environment)

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              cfg.DSN,
		Environment:      cfg.Environment,
		Release:          cfg.Release,
		ServerName:       cfg.ServerName,
		Debug:            cfg.Debug,
		SampleRate:       sampleRate,
		TracesSampleRate: tracesSampleRate,
		EnableTracing:    true,
		EnableLogs:       true,
		AttachStacktrace: true,
		SendDefaultPII:   false,
		MaxBreadcrumbs:   50,
		MaxErrorDepth:    10,
		MaxSpans:         1000,
		BeforeSend:       beforeSendHook,
		BeforeSendTransaction: beforeSendTransactionHook,
		BeforeBreadcrumb: beforeBreadcrumbHook,
		IgnoreErrors: []string{
			"context canceled",
			"connection reset by peer",
			"EOF",
		},
		IgnoreTransactions: []string{
			"/healthz",
			"/api/healthz",
			"/metrics",
		},
	})

	if err != nil {
		return fmt.Errorf("sentry initialization failed: %w", err)
	}

	log.Printf("✅ Sentry initialized: env=%s, sample_rate=%.2f, traces_sample_rate=%.2f, tracing_enabled=true",
		cfg.Environment, sampleRate, tracesSampleRate)
	return nil
}

func getSampleRate(env string) float64 {
	switch strings.ToLower(env) {
	case "production":
		return 1.0
	case "staging":
		return 1.0
	default:
		return 1.0
	}
}

func getTracesSampleRate(env string) float64 {
	switch strings.ToLower(env) {
	case "production":
		return 0.1
	case "staging":
		return 0.3
	default:
		return 1.0
	}
}

func beforeSendHook(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
	if event.Request != nil {
		event.Request.Cookies = ""
		event.Request = scrubRequestData(event.Request)
	}

	if event.User.Email != "" {
		event.User.Email = maskEmail(event.User.Email)
	}
	if event.User.IPAddress != "" {
		event.User.IPAddress = maskIP(event.User.IPAddress)
	}

	if event.Extra != nil {
		event.Extra = scrubMap(event.Extra)
	}

	return event
}

func beforeSendTransactionHook(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
	if event.Request != nil {
		event.Request = scrubRequestData(event.Request)
	}
	return event
}

func beforeBreadcrumbHook(breadcrumb *sentry.Breadcrumb, hint *sentry.BreadcrumbHint) *sentry.Breadcrumb {
	if breadcrumb.Data != nil {
		breadcrumb.Data = scrubMap(breadcrumb.Data)
	}
	return breadcrumb
}

func scrubRequestData(req *sentry.Request) *sentry.Request {
	if req.Headers != nil {
		for key := range req.Headers {
			if isSensitiveField(key) {
				req.Headers[key] = "[REDACTED]"
			}
		}
	}



	return req
}

func scrubMap(data map[string]interface{}) map[string]interface{} {
	scrubbed := make(map[string]interface{})
	for key, value := range data {
		if isSensitiveField(key) {
			scrubbed[key] = "[REDACTED]"
			continue
		}

		switch v := value.(type) {
		case map[string]interface{}:
			scrubbed[key] = scrubMap(v)
		case string:
			scrubbed[key] = scrubSensitiveString(v)
		default:
			scrubbed[key] = value
		}
	}
	return scrubbed
}

func isSensitiveField(field string) bool {
	lowerField := strings.ToLower(field)
	for _, sensitive := range sensitiveFields {
		if strings.Contains(lowerField, sensitive) {
			return true
		}
	}
	return false
}

func scrubSensitiveString(s string) string {
	jwtPattern := regexp.MustCompile(`eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*`)
	s = jwtPattern.ReplaceAllString(s, "[JWT_REDACTED]")

	bearerPattern := regexp.MustCompile(`Bearer\s+[A-Za-z0-9-._~+/]+=*`)
	s = bearerPattern.ReplaceAllString(s, "Bearer [REDACTED]")

	return s
}

func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "[REDACTED]"
	}
	if len(parts[0]) <= 2 {
		return "**@" + parts[1]
	}
	return parts[0][:2] + "***@" + parts[1]
}

func maskIP(ip string) string {
	parts := strings.Split(ip, ".")
	if len(parts) == 4 {
		return fmt.Sprintf("%s.%s.%s.***", parts[0], parts[1], parts[2])
	}
	return "[REDACTED]"
}

func CaptureError(err error, tags map[string]string, extra map[string]interface{}) {
	hub := sentry.CurrentHub()
	hub.WithScope(func(scope *sentry.Scope) {
		for k, v := range tags {
			scope.SetTag(k, v)
		}
		for k, v := range extra {
			scope.SetExtra(k, v)
		}
		hub.CaptureException(err)
	})
}

func CaptureMessage(message string, level sentry.Level, tags map[string]string) {
	hub := sentry.CurrentHub()
	hub.WithScope(func(scope *sentry.Scope) {
		scope.SetLevel(level)
		for k, v := range tags {
			scope.SetTag(k, v)
		}
		hub.CaptureMessage(message)
	})
}

// StartDatabaseSpan creates a span for database operations
// Usage: defer StartDatabaseSpan(ctx, "SELECT users WHERE email = ?").Finish()
func StartDatabaseSpan(ctx context.Context, query string) *sentry.Span {
	span := sentry.StartSpan(ctx, "db.query")
	span.SetTag("db.operation", "query")
	span.SetData("db.query", scrubSensitiveString(query))
	return span
}

// StartExternalAPISpan creates a span for external API calls
// Usage: defer StartExternalAPISpan(ctx, "POST", "https://api.paystack.co/transaction/initialize").Finish()
func StartExternalAPISpan(ctx context.Context, method, url string) *sentry.Span {
	span := sentry.StartSpan(ctx, "http.client")
	span.SetTag("http.method", method)
	span.SetTag("http.url", scrubSensitiveString(url))
	return span
}

// SetBusinessContext adds business-specific context to the current scope
// Usage: SetBusinessContext(ctx, "payment", map[string]interface{}{"survey_id": "123", "amount": 5000})
func SetBusinessContext(ctx context.Context, contextName string, data map[string]interface{}) {
	hub := sentry.CurrentHub()
	if hub != nil {
		hub.Scope().SetContext(contextName, scrubMap(data))
	}
}

// SetUserContext sets user information in Sentry scope
func SetUserContext(userID, email, role string) {
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{
			ID:       userID,
			Email:    maskEmail(email),
			Username: role,
		})
		scope.SetTag("user_role", role)
	})
}
