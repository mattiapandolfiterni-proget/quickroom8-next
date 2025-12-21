/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // This prevents the build from timing out
  staticPageGenerationTimeout: 1000,
};
module.exports = nextConfig;
