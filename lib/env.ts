/**
 * Environment variable validation and type-safe access
 * Ensures all required environment variables are defined at build time
 */

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Add it to your .env.local or Render dashboard.`
    )
  }

  return value
}

export const env = {
  // API URLs
  NEXT_PUBLIC_API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8081/api'),
  BACKEND_URL: getEnv('BACKEND_URL', 'http://localhost:8081'),
  NEXT_PUBLIC_APP_URL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  // Feature flags (optional)
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const

// Validate at module load time
if (typeof window === 'undefined') {
  // Server-side validation
  try {
    // Access each env var to trigger validation
    Object.values(env)
  } catch (error) {
    console.error('Environment variable validation failed:', error)
    throw error
  }
}
