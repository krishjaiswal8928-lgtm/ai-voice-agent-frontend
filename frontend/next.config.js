/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  distDir: '../out',
  images: {
    unoptimized: true,
  },
  experimental: {
    // appDir: true, // Removed as it's no longer needed in newer Next.js versions
    turbopack: {
      root: "."
    }
  },
}

module.exports = nextConfig