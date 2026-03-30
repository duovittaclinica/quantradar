/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.brapi.dev' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'QuantRadar',
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || 'https://quantradar.vercel.app',
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'ioredis'],
};

module.exports = nextConfig;
