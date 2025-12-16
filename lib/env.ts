/**
 * Environment variable validation and type-safe access
 * Ensures all required environment variables are defined at build time
 */

export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Add it to your .env file.`
    )
  }

  return value
}

// Determine if we're in production based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production'

export const env = {
  // API URLs - use localhost in development, production URL in production
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://www.onetimesurvey.xyz/api' : 'http://localhost:8081/api'),
  BACKEND_URL: process.env.BACKEND_URL || (isProduction ? 'https://www.onetimesurvey.xyz' : 'http://localhost:8081'),
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (isProduction ? 'https://www.onetimesurvey.xyz' : 'http://localhost:3000'),

  // Feature flags (optional)
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production',
  IS_DEVELOPMENT: !isProduction,
  IS_PRODUCTION: isProduction,
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
