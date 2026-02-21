/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.drugs.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
