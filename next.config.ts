import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["geist"],
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
   webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      }
    }
    return config
  },
  images: {
     dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: '',
        pathname: '/**',
      },
            {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "moritotabi.com",
        port: '',
        pathname: '/**',
      },
      {
        hostname: "localhost",
        port: '',
        pathname: '/**',
      },
    ],
  },
  // HEADERS
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
