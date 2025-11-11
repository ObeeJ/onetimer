import { NextRequest, NextResponse } from 'next/server'
import { getEnv } from '@/lib/env'

const REQUEST_TIMEOUT = 30000 // 30 seconds

/**
 * Get error message based on error type
 */
function getErrorResponse(error: unknown) {
  let message = 'Backend service unavailable'
  let errorType = 'SERVICE_UNAVAILABLE'

  if (error instanceof TypeError) {
    if (error.message.includes('fetch failed')) {
      message = 'Unable to connect to backend service'
      errorType = 'CONNECTION_ERROR'
    } else if (error.message.includes('timeout')) {
      message = 'Request timeout - backend service took too long to respond'
      errorType = 'TIMEOUT_ERROR'
    }
  }

  return {
    error: errorType,
    errorType,
    message,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params.slug, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params.slug, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params.slug, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return proxyRequest(request, params.slug, 'DELETE')
}

/**
 * Proxy request to backend with error handling
 */
async function proxyRequest(request: NextRequest, slug: string[], method: string) {
  try {
    const BACKEND_URL = getEnv('BACKEND_URL')
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/${slug.join('/')}`

    // Forward query parameters
    const searchParams = new URLSearchParams(url.searchParams)
    const finalUrl = searchParams.toString()
      ? `${backendUrl}?${searchParams.toString()}`
      : backendUrl

    const headers: Record<string, string> = {}

    // Forward important headers
    const headersToForward = [
      'authorization',
      'content-type',
      'cookie',
      'user-agent',
      'x-forwarded-for',
      'x-real-ip',
    ]

    headersToForward.forEach((header) => {
      const value = request.headers.get(header)
      if (value) {
        headers[header] = value
      }
    })

    const body = method !== 'GET' && method !== 'DELETE'
      ? await request.text()
      : undefined

    // Make request with timeout
    const response = await fetchWithTimeout(finalUrl, {
      method,
      headers,
      body,
    })

    const responseData = await response.text()

    // Forward backend response with Set-Cookie headers for httpOnly cookies
    const responseHeaders: Record<string, string> = {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store',
    }

    // Forward Set-Cookie headers from backend for httpOnly cookie handling
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      responseHeaders['Set-Cookie'] = setCookieHeader
    }

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const statusCode = isTimeout ? 504 : 503
    const errorResponse = getErrorResponse(error)

    console.error(`[API Proxy] ${errorResponse.errorType}:`, {
      slug: slug.join('/'),
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}