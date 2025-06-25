/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable static exports if needed
  // output: 'export',
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'api.fourentech.ai',
      'storage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub avatars
    ],
    formats: ['image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Scoring AI',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CORS_ORIGIN || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Rewrites for API proxying (if needed)
  async rewrites() {
    return [
      // Example: Proxy n8n webhook
      // {
      //   source: '/webhook/:path*',
      //   destination: `${process.env.N8N_BASE_URL}/webhook/:path*`,
      // },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here
    
    // Example: Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Ignore certain modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Enable app directory if using Next.js 13+
    // appDir: true,
    
    // Optimize CSS
    optimizeCss: true,
    
    // Enable server components
    // serverComponents: true,
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'utils', 'services'],
  },

  // PWA configuration (requires next-pwa package)
  // pwa: {
  //   dest: 'public',
  //   disable: process.env.NODE_ENV === 'development',
  //   register: true,
  //   skipWaiting: true,
  // },

  // Compression
  compress: true,

  // Build output
  distDir: '.next',

  // Generate build ID
  generateBuildId: async () => {
    // You can return a custom build ID here
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Production browser source maps
  productionBrowserSourceMaps: false,

  // Trailing slash
  trailingSlash: false,

  // React strict mode
  reactStrictMode: true,

  // Powered by header
  poweredByHeader: false,

  // Base path (if deploying to a subdirectory)
  // basePath: '/app',

  // Asset prefix (for CDN)
  // assetPrefix: 'https://cdn.example.com',
};

module.exports = nextConfig;