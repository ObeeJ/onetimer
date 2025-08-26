/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Frontend-only configuration
  output: 'standalone', // For deployment flexibility
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
  },
  // Remove server-side features we won't use
  serverExternalPackages: [],
}

export default nextConfig
