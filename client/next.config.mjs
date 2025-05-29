/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better performance
  output: 'standalone',

  // Handle environment-specific settings
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8501',
  },

  // Skip linting during build (for faster builds)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize images
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },

  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig