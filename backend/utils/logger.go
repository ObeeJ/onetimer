package utils

import (
	"fmt"
	"log"
	"os"
	"time"
)

type LogLevel string

const (
	DEBUG LogLevel = "DEBUG"
	INFO  LogLevel = "INFO"
	WARN  LogLevel = "WARN"
	ERROR LogLevel = "ERROR"
	FATAL LogLevel = "FATAL"
)

type Logger struct {
	level  LogLevel
	logger *log.Logger
}

var defaultLogger *Logger

func init() {
	defaultLogger = NewLogger(INFO)
}

func NewLogger(level LogLevel) *Logger {
	return &Logger{
		level:  level,
		logger: log.New(os.Stdout, "", log.LstdFlags),
	}
}

func (l *Logger) log(level LogLevel, message string, args ...interface{}) {
	formattedMsg := fmt.Sprintf(message, args...)
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	l.logger.Printf("[%s] %s: %s", timestamp, level, formattedMsg)
}

func (l *Logger) Debug(message string, args ...interface{}) {
	if l.level == DEBUG {
		l.log(DEBUG, message, args...)
	}
}

func (l *Logger) Info(message string, args ...interface{}) {
	l.log(INFO, message, args...)
}

func (l *Logger) Warn(message string, args ...interface{}) {
	l.log(WARN, message, args...)
}

func (l *Logger) Error(message string, args ...interface{}) {
	l.log(ERROR, message, args...)
}

func (l *Logger) Fatal(message string, args ...interface{}) {
	l.log(FATAL, message, args...)
	os.Exit(1)
}

// Global functions
func LogDebug(message string, args ...interface{}) {
	defaultLogger.Debug(message, args...)
}

func LogInfo(message string, args ...interface{}) {
	defaultLogger.Info(message, args...)
}

func LogWarn(message string, args ...interface{}) {
	defaultLogger.Warn(message, args...)
}

func LogError(message string, args ...interface{}) {
	defaultLogger.Error(message, args...)
}

func LogFatal(message string, args ...interface{}) {
	defaultLogger.Fatal(message, args...)
}
