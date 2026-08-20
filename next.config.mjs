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
            // UPDATED: Added extra Iframely and Canva domains to ensure the iframe renders
            value: "frame-ancestors 'self' https://www.canva.com https://*.canva.com https://*.canva-apps.com https://iframely.com https://*.iframely.com https://iframe.ly https://*.iframe.ly;"
          },
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