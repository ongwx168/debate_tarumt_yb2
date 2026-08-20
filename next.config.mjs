/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.canva.com https://*.canva.com https://*.canva-apps.com https://iframely.com;"
          },
          // ADD THIS: Overrides Next.js's default SAMEORIGIN block
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          }
        ],
      },
    ]
  },
}

export default nextConfig;