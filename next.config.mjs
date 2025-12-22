/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Server configuration
  serverRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5216',
  },
  publicRuntimeConfig: {
    frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
}

export default nextConfig
