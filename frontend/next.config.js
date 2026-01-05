/** @type {import('next').NextConfig} */
// Force Vercel cache bust for security update
const nextConfig = {
  output: 'standalone', // Use standalone mode for server-side rendering (required for dynamic routes)
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // appDir: true, // Removed as it's no longer needed in newer Next.js versions
    turbopack: {
      root: "."
    }
  },
}

module.exports = nextConfig
