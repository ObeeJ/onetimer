package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisCache(url string, ttl int) *Cache {
	opt, _ := redis.ParseURL(url)
	client := redis.NewClient(opt)
	
	return &Cache{
		client: client,
		ttl:    time.Duration(ttl) * time.Second,
	}
}

func (c *Cache) Set(ctx context.Context, key string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, data, c.ttl).Err()
}

func (c *Cache) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(data), dest)
}

func (c *Cache) Delete(ctx context.Context, key string) error {
	return c.client.Del(ctx, key).Err()
}

func (c *Cache) Exists(ctx context.Context, key string) bool {
	result := c.client.Exists(ctx, key)
	return result.Val() > 0
}

// NewCache creates a simple in-memory cache for development
func NewCache() *Cache {
	// For development, use a simple Redis client with default settings
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		DB:   0,
	})
	
	return &Cache{
		client: client,
		ttl:    time.Hour,
	}
}