/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Digital Society Simulator',
  },
  images: { unoptimized: true },
  poweredByHeader: false,
}

module.exports = nextConfig
