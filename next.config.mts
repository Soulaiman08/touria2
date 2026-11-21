import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    qualities: [75, 85, 90, 92, 95],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'] as const,
  },

  allowedDevOrigins: [
    'thuraya-almaghribi.local',
    'localhost',
    '127.0.0.1',
    '*.run.app',
    '**.run.app',
    '**.aistudio.google.com',
  ],

  devIndicators: false,
}

export default withNextIntl(nextConfig)