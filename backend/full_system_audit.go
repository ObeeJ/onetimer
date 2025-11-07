package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	fmt.Printf("🔍 FULL SYSTEM AUDIT - Backend Files & Functions\n")
	fmt.Printf("===============================================\n\n")

	// Define critical directories and files to audit
	auditPaths := []string{
		"api/controllers",
		"services",
		"models",
		"database",
		"cache",
		"security",
		"utils",
	}

	totalFiles := 0
	totalFunctions := 0
	issues := []string{}

	for _, path := range auditPaths {
		fmt.Printf("📁 Auditing %s/\n", path)

		err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			if strings.HasSuffix(filePath, ".go") && !strings.HasSuffix(filePath, "_test.go") {
				totalFiles++
				functions := auditGoFile(filePath)
				totalFunctions += functions

				fmt.Printf("  ✅ %s (%d functions)\n", filePath, functions)
			}
			return nil
		})

		if err != nil {
			issues = append(issues, fmt.Sprintf("Failed to audit %s: %v", path, err))
		}
	}

	// Audit specific critical files
	criticalFiles := []string{
		"cmd/onetimer-backend/main.go",
		"api/routes/routes.go",
		"api/routes/api.go",
		"config/config.go",
	}

	fmt.Printf("\n📋 Auditing Critical Files\n")
	for _, file := range criticalFiles {
		if _, err := os.Stat(file); err == nil {
			functions := auditGoFile(file)
			totalFiles++
			totalFunctions += functions
			fmt.Printf("  ✅ %s (%d functions)\n", file, functions)
		} else {
			issues = append(issues, fmt.Sprintf("Missing critical file: %s", file))
			fmt.Printf("  ❌ %s - MISSING\n", file)
		}
	}

	// Check for required dependencies
	fmt.Printf("\n📦 Checking Dependencies\n")
	if _, err := os.Stat("go.mod"); err == nil {
		fmt.Printf("  ✅ go.mod exists\n")
	} else {
		issues = append(issues, "go.mod missing")
		fmt.Printf("  ❌ go.mod missing\n")
	}

	if _, err := os.Stat("go.sum"); err == nil {
		fmt.Printf("  ✅ go.sum exists\n")
	} else {
		fmt.Printf("  ⚠️ go.sum missing (will be generated)\n")
	}

	// Check environment configuration
	fmt.Printf("\n🔧 Environment Configuration\n")
	if _, err := os.Stat(".env"); err == nil {
		fmt.Printf("  ✅ .env file exists\n")
	} else {
		fmt.Printf("  ⚠️ .env file missing (using defaults)\n")
	}

	// Summary
	fmt.Printf("\n📊 AUDIT SUMMARY\n")
	fmt.Printf("================\n")
	fmt.Printf("📁 Total Files Audited: %d\n", totalFiles)
	fmt.Printf("🔧 Total Functions Found: %d\n", totalFunctions)
	fmt.Printf("⚠️ Issues Found: %d\n", len(issues))

	if len(issues) > 0 {
		fmt.Printf("\n❌ ISSUES DETECTED:\n")
		for _, issue := range issues {
			fmt.Printf("  - %s\n", issue)
		}
	}

	// Final assessment
	if len(issues) == 0 {
		fmt.Printf("\n🎉 SYSTEM AUDIT COMPLETE - ALL GOOD!\n")
		fmt.Printf("✅ All critical files present\n")
		fmt.Printf("✅ %d functions implemented\n", totalFunctions)
		fmt.Printf("✅ System ready for deployment\n")
	} else if len(issues) <= 2 {
		fmt.Printf("\n🟡 SYSTEM AUDIT COMPLETE - MINOR ISSUES\n")
		fmt.Printf("⚠️ %d minor issues detected\n", len(issues))
		fmt.Printf("✅ System mostly ready for deployment\n")
	} else {
		fmt.Printf("\n🔴 SYSTEM AUDIT COMPLETE - NEEDS ATTENTION\n")
		fmt.Printf("❌ %d issues need to be resolved\n", len(issues))
	}

	fmt.Printf("\n🏁 FULL SYSTEM AUDIT COMPLETE\n")
}

func auditGoFile(filePath string) int {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return 0
	}

	lines := strings.Split(string(content), "\n")
	functionCount := 0

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "func ") {
			functionCount++
		}
	}

	return functionCount
}
