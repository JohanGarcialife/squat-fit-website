/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'iframe.mediadelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://iframe.mediadelivery.net https://*.b-cdn.net https://js.stripe.com https://hooks.stripe.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com https://squatfit-api-cyrc2g3zra-no.a.run.app https://api.frankfurter.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
