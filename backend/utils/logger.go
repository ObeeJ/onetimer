package utils

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"runtime"
	"strings"
)

var globalLogger *slog.Logger

func init() {
	// Initialize slog with JSON handler
	// This outputs to stdout which Render automatically captures
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: true, // Shows file:line in logs
	})
	globalLogger = slog.New(handler)
	slog.SetDefault(globalLogger)
}

// GetLogger returns a logger with context (includes trace_id if set)
func GetLogger(ctx context.Context) *slog.Logger {
	logger := globalLogger

	// Extract trace_id from context if available
	if traceID, ok := ctx.Value("trace_id").(string); ok && traceID != "" {
		logger = logger.With("trace_id", traceID)
	}

	// Extract user_id from context if available
	if userID, ok := ctx.Value("user_id").(string); ok && userID != "" {
		logger = logger.With("user_id", userID)
	}

	return logger
}

// FuncEntry logs function entry with arguments
// Usage: defer FuncExit(FuncEntry(ctx, "functionName", arg1, arg2))
func FuncEntry(ctx context.Context, funcName string, args ...interface{}) (context.Context, map[string]interface{}) {
	pc, file, line, _ := runtime.Caller(1)
	fn := runtime.FuncForPC(pc)

	// Extract package and function name
	fullName := fn.Name()
	parts := strings.Split(fullName, ".")
	pkg := strings.Join(parts[:len(parts)-1], ".")

	logger := GetLogger(ctx)

	// Create a map of arguments for logging
	argMap := make(map[string]interface{})
	for i, arg := range args {
		argMap[fmt.Sprintf("arg%d", i)] = arg
	}

	logger.Info(fmt.Sprintf("→ ENTER %s", funcName),
		"file", fmt.Sprintf("%s:%d", file, line),
		"package", pkg,
		"args", argMap,
	)

	return ctx, map[string]interface{}{
		"funcName": funcName,
		"startTime": map[string]interface{}{},
	}
}

// FuncExit logs function exit with return values
func FuncExit(ctx context.Context, data map[string]interface{}, returns ...interface{}) {
	_, file, line, _ := runtime.Caller(1)

	funcName := data["funcName"].(string)

	logger := GetLogger(ctx)

	// Create a map of return values
	returnMap := make(map[string]interface{})
	for i, ret := range returns {
		returnMap[fmt.Sprintf("return%d", i)] = ret
	}

	logger.Info(fmt.Sprintf("← EXIT %s", funcName),
		"file", fmt.Sprintf("%s:%d", file, line),
		"returns", returnMap,
	)
}

// LogInfo logs an info message with key-value pairs
func LogInfo(ctx context.Context, msg string, keysAndValues ...interface{}) {
	GetLogger(ctx).Info(msg, keysAndValues...)
}

// LogWarn logs a warning message
func LogWarn(ctx context.Context, msg string, keysAndValues ...interface{}) {
	GetLogger(ctx).Warn(msg, keysAndValues...)
}

// LogError logs an error with stack trace
func LogError(ctx context.Context, msg string, err error, keysAndValues ...interface{}) {
	logger := GetLogger(ctx)

	// Add error details
	attrs := append(keysAndValues,
		"error", err.Error(),
		"error_type", fmt.Sprintf("%T", err),
	)

	// Try to add stack trace if available
	if stackErr := err.Error(); stackErr != "" {
		// Format: try to extract meaningful context
		attrs = append(attrs, "stack", fmt.Sprintf("%+v", err))
	}

	logger.Error(msg, attrs...)
}

// LogDebug logs debug message (disabled in prod by default)
func LogDebug(ctx context.Context, msg string, keysAndValues ...interface{}) {
	GetLogger(ctx).Debug(msg, keysAndValues...)
}

// LogFatal logs and exits
func LogFatal(ctx context.Context, msg string, keysAndValues ...interface{}) {
	GetLogger(ctx).Error(msg, keysAndValues...)
	os.Exit(1)
}

// Legacy compatibility functions (for existing code)
// These don't have context, so use background context

func LogInfoSimple(message string, args ...interface{}) {
	globalLogger.Info(message, args...)
}

func LogWarnSimple(message string, args ...interface{}) {
	globalLogger.Warn(message, args...)
}

func LogErrorSimple(message string, args ...interface{}) {
	globalLogger.Error(message, args...)
}
