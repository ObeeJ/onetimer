package middleware

import (
	"net"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// IPWhitelist middleware for admin/super-admin routes
func IPWhitelist() fiber.Handler {
	// Load whitelisted IPs from environment
	whitelistStr := os.Getenv("ADMIN_IP_WHITELIST")
	if whitelistStr == "" {
		// If not set, allow all (for development)
		return func(c *fiber.Ctx) error {
			return c.Next()
		}
	}

	whitelist := strings.Split(whitelistStr, ",")
	
	return func(c *fiber.Ctx) error {
		clientIP := c.Get("x-forwarded-for", c.IP())
		
		// Check if IP is whitelisted
		if !isIPWhitelisted(clientIP, whitelist) {
			return c.Status(403).JSON(fiber.Map{
				"error": "Access denied from this IP address",
				"code":  "IP_NOT_WHITELISTED",
			})
		}

		return c.Next()
	}
}

func isIPWhitelisted(clientIP string, whitelist []string) bool {
	for _, allowedIP := range whitelist {
		allowedIP = strings.TrimSpace(allowedIP)
		
		// Check for CIDR notation
		if strings.Contains(allowedIP, "/") {
			_, ipNet, err := net.ParseCIDR(allowedIP)
			if err == nil {
				ip := net.ParseIP(clientIP)
				if ip != nil && ipNet.Contains(ip) {
					return true
				}
			}
		} else {
			// Exact IP match
			if clientIP == allowedIP {
				return true
			}
		}
	}
	return false
}
