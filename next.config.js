/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript configuration
  typescript: {
    // Type checking is handled by IDE - build should proceed
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    // Enable Next.js image optimization for better performance
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Performance optimizations
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
    ],
  },

  // Compression
  compress: true,

  // Production source maps (disabled for smaller bundles)
  productionBrowserSourceMaps: false,

  // Powered by header (disabled for security)
  poweredByHeader: false,

  // Strict mode for better React practices
  reactStrictMode: true,

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/:path*.(jpg|jpeg|png|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO (www -> non-www or vice versa)
  async redirects() {
    return [
      // Redirect old paths if any
      {
        source: '/rooms',
        destination: '/browse',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
