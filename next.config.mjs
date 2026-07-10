/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite builds independientes por instancia (dos URLs en paralelo):
  //   NEXT_DIST=.next-a npm run build && NEXT_DIST=.next-a PORT=3000 npm run start
  //   NEXT_DIST=.next-b npm run build && NEXT_DIST=.next-b PORT=4000 npm run start
  // Sin la variable se comporta igual que siempre (.next).
  distDir: process.env.NEXT_DIST || '.next',
  images: {
    // AVIF antes que WebP: sobre fotos comprime bastante mejor. Next negocia por
    // Accept, así que un navegador sin AVIF sigue recibiendo WebP.
    formats: ['image/avif', 'image/webp'],
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
            value: "default-src 'self'; frame-src 'self' https://iframe.mediadelivery.net https://*.b-cdn.net https://js.stripe.com https://hooks.stripe.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com https://squatfit-api-cyrc2g3zra-no.a.run.app https://api.frankfurter.app https://storage.googleapis.com https://*.b-cdn.net https://images.pexels.com; img-src 'self' data: blob: https://images.unsplash.com https://storage.googleapis.com https://www.google.com https://*.b-cdn.net https://iframe.mediadelivery.net https://images.pexels.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
