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
  // La antigua ruta /planes pasó a llamarse /programa (reestructura de marca).
  // Redirección permanente para no romper enlaces guardados ni SEO.
  async redirects() {
    return [
      { source: '/planes', destination: '/programa', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; frame-src 'self' https://iframe.mediadelivery.net https://*.b-cdn.net https://js.stripe.com https://hooks.stripe.com https://tidycal.com https://*.tidycal.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://asset-tidycal.b-cdn.net https://www.googletagmanager.com; connect-src 'self' https://api.stripe.com https://squatfit-api-cyrc2g3zra-no.a.run.app https://open.er-api.com https://api.frankfurter.app https://storage.googleapis.com https://*.b-cdn.net https://images.pexels.com https://tidycal.com https://*.tidycal.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; img-src 'self' data: blob: https://images.unsplash.com https://storage.googleapis.com https://www.google.com https://*.b-cdn.net https://iframe.mediadelivery.net https://images.pexels.com https://tidycal.com https://*.tidycal.com https://www.google-analytics.com https://*.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:;",
          },
          // ⚠️ TEMPORAL — QUITAR EN EL LANZAMIENTO (a la vez que se activan las 301).
          // Evita que Google indexe la web nueva mientras squatfit.es sigue vivo,
          // para no penalizar por contenido duplicado. Al migrar el dominio,
          // borrar este bloque para que squadfit.es vuelva a ser indexable.
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
