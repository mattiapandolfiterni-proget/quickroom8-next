/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignora errori di TypeScript durante il build
    typescript: {
      ignoreBuildErrors: true,
    },
    // Ignora errori di stile (ESLint) durante il build
    eslint: {
      ignoreDuringBuilds: true,
    },
    // Evita che le immagini facciano crashare il sito
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    },
    // Evita errori strani se usi Suspense
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
  };
  
  module.exports = nextConfig; 