# Sentry Fiber SDK Usage Guide

## Configuration Complete ✅

The Fiber Sentry SDK is now fully configured with:
- Automatic error tracking on all routes
- Request context enrichment (environment, method, path)
- Custom event tagging capabilities
- BeforeSend hooks for data scrubbing

## Usage Examples

### 1. Capture Custom Messages in Routes

```go
import (
    "github.com/getsentry/sentry-go"
    "onetimer-backend/observability"
)

func YourHandler(ctx *fiber.Ctx) error {
    // Capture a warning message
    observability.CaptureMessageFromContext(ctx, 
        "User provided invalid query parameter", 
        sentry.LevelWarning,
        map[string]interface{}{
            "query": ctx.Query("param"),
            "user_id": ctx.Locals("user_id"),
        },
    )
    
    return ctx.SendStatus(fiber.StatusOK)
}
```

### 2. Capture Errors with Context

```go
func YourHandler(ctx *fiber.Ctx) error {
    err := someOperation()
    if err != nil {
        observability.CaptureErrorFromContext(ctx, err,
            map[string]string{
                "operation": "payment_processing",
                "user_role": "creator",
            },
            map[string]interface{}{
                "amount": 1000,
                "currency": "NGN",
            },
        )
        return ctx.Status(500).JSON(fiber.Map{"error": "Operation failed"})
    }
    return ctx.SendStatus(fiber.StatusOK)
}
```

### 3. Manual Hub Access (Advanced)

```go
import sentryfiber "github.com/getsentry/sentry-go/fiber"

func YourHandler(ctx *fiber.Ctx) error {
    if hub := sentryfiber.GetHubFromContext(ctx); hub != nil {
        hub.WithScope(func(scope *sentry.Scope) {
            scope.SetTag("custom_tag", "value")
            scope.SetExtra("metadata", map[string]string{"key": "value"})
            hub.CaptureMessage("Custom event")
        })
    }
    return ctx.SendStatus(fiber.StatusOK)
}
```

## Environment Variables

Ensure these are set in your `.env`:
```
SENTRY_DSN=https://7d8ee87badeeb2195ab4d0205bf0b014@o4510474134224896.ingest.us.sentry.io/4510491762819072
SENTRY_RELEASE=onetimer-backend@dev
SENTRY_SERVER_NAME=
ENV=development
```

## Features Enabled

✅ Automatic panic recovery and reporting  
✅ Request context tracking (method, path, environment)  
✅ PII data scrubbing (emails, IPs, tokens)  
✅ Performance tracing (100% in dev, 10% in production)  
✅ Structured logging to Sentry  
✅ Custom error and message capture with context  

## Testing

To test Sentry integration, trigger a panic:
```go
app.Get("/test-sentry", func(ctx *fiber.Ctx) error {
    panic("Testing Sentry integration")
})
```

Visit the endpoint and check your Sentry dashboard.
