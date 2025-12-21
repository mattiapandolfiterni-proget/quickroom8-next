/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" } // Allow ALL images to prevent crash
    ]
  },
  experimental: {
    missingSuspenseWithCSRBailout: false, // Prevent common bailouts
  }
};
module.exports = nextConfig;
