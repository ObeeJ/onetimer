package observability

import (
	"github.com/getsentry/sentry-go"
	sentryfiber "github.com/getsentry/sentry-go/fiber"
	"github.com/gofiber/fiber/v2"
)

// CaptureMessageFromContext captures a message with the current request context
func CaptureMessageFromContext(ctx *fiber.Ctx, message string, level sentry.Level, extra map[string]interface{}) {
	if hub := sentryfiber.GetHubFromContext(ctx); hub != nil {
		hub.WithScope(func(scope *sentry.Scope) {
			scope.SetLevel(level)
			for k, v := range extra {
				scope.SetExtra(k, v)
			}
			hub.CaptureMessage(message)
		})
	}
}

// CaptureErrorFromContext captures an error with the current request context
func CaptureErrorFromContext(ctx *fiber.Ctx, err error, tags map[string]string, extra map[string]interface{}) {
	if hub := sentryfiber.GetHubFromContext(ctx); hub != nil {
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
}
