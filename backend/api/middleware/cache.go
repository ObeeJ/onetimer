package middleware

import (
	"crypto/md5"
	"fmt"
	"onetimer-backend/cache"

	"github.com/gofiber/fiber/v2"
)

func CacheMiddleware(cache *cache.Cache) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Only cache GET requests
		if c.Method() != "GET" {
			return c.Next()
		}

		// Generate cache key
		key := generateCacheKey(c)
		
		// Try to get from cache
		var cachedResponse map[string]interface{}
		if err := cache.Get(c.Context(), key, &cachedResponse); err == nil {
			c.Set("X-Cache", "HIT")
			return c.JSON(cachedResponse)
		}

		// Continue to handler
		c.Set("X-Cache", "MISS")
		c.Locals("cache_key", key)
		
		return c.Next()
	}
}

func generateCacheKey(c *fiber.Ctx) string {
	path := c.Path()
	query := c.Request().URI().QueryString()
	userID := c.Locals("user_id")
	
	data := fmt.Sprintf("%s?%s&user=%v", path, query, userID)
	hash := md5.Sum([]byte(data))
	return fmt.Sprintf("cache:%x", hash)
}