import legacyRedirects from './redirects-legacy.mjs';
import { formLinkRedirects } from './form-links.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite builds independientes por instancia (dos URLs en paralelo):
  //   NEXT_DIST=.next-a npm run build && NEXT_DIST=.next-a PORT=3000 npm run start
  //   NEXT_DIST=.next-b npm run build && NEXT_DIST=.next-b PORT=4000 npm run start
  // Sin la variable se comporta igual que siempre (.next).
  distDir: process.env.NEXT_DIST || '.next',
  // Versión desplegada, incrustada en el bundle del navegador. La usa
  // RecargaSiHayDespliegue.js para saber si una pestaña restaurada de la caché
  // de atrás/adelante se quedó en un despliegue anterior. Fuera de Vercel
  // (local) vale 'dev' y ese mecanismo se queda desactivado.
  env: {
    NEXT_PUBLIC_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'dev',
  },
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
      // Dominio viejo -> nuevo. Van PRIMERO: todas llevan condición de host, así
      // que en squadfit.es no disparan nunca, y en squatfit.es tienen que ganar
      // a los enlaces cortos de abajo. Si no, /unete en el dominio viejo se
      // quedaría allí en vez de mandar a la web nueva.
      ...legacyRedirects,
      // Enlaces cortos al formulario, uno por origen (los antiguos Pretty Links).
      ...formLinkRedirects,
      // /formulario en el dominio NUEVO. Hasta ahora daba 404: la regla de
      // redirects-legacy.mjs lleva condición de host y solo dispara en
      // squatfit.es, así que quien copiaba el enlace del correo y le cambiaba
      // el dominio a mano —o quien lo tenga guardado ya reescrito— se estrellaba.
      // Mismo destino y mismo 307 que la del dominio viejo.
      {
        source: '/formulario',
        destination: '/empieza-tu-cambio?via=formulario',
        permanent: false,
      },
      // Atajos de «el libro» al sitio donde se vende.
      //
      // POR QUÉ EXISTEN. El 4-ago un cliente escribió DOS VECES a
      // hola@squadfit.es: «quisiera comprar su libro pero no encuentro enlace,
      // ni siquiera en su página», y después «entro en el enlace pero no
      // encuentro dónde clickear, ¿me puedes mandar una captura?». Tenía razón:
      // la portada nombra «libro» UNA sola vez, el menú dice «Cocina» y la
      // página se titula «BIBLIOTECA DE RECETAS». Quien busca «el libro» no
      // reconoce el camino, y al probar a adivinar la URL se estrella.
      //
      // Medido el 5-ago contra producción: las ocho de abajo daban 404 en LOS
      // DOS dominios. Ojo con esto último, porque es lo que hace falta aquí y
      // no lo cubría nada: redirects-legacy.mjs sí tiene /libro-de-cocina, pero
      // con condición de host, así que solo dispara en squatfit.es; y /libro a
      // secas no está en ese mapa, o sea que no existía en ningún sitio.
      //
      // ESTO NO ARREGLA EL PROBLEMA DE FONDO, que es cómo se llama el libro en
      // el menú y en la portada. Eso es copy, y es de María. Esto solo evita
      // que quien adivine la URL —o a quien se la dicten por teléfono— acabe
      // en un 404 teniendo el dinero en la mano.
      //
      // 307 y no 308 a propósito: son alias de conveniencia, no URLs con
      // historial que consolidar. Si algún día hay una página /libro de verdad,
      // un 308 se habría quedado cacheado en los navegadores.
      ...[
        '/libro',
        '/libros',
        '/libro-de-cocina',
        '/libros-de-cocina',
        '/libro-de-recetas',
        '/comprar-libro',
        '/recetas',
        '/recetario',
      ].map((source) => ({ source, destination: '/cocina', permanent: false })),
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // OJO al tocar los dominios de Stripe: desde el «pago incrustado»
            // (checkout-incrustado) el formulario de pago se monta en un iframe
            // DENTRO de nuestra página, no en checkout.stripe.com como antes.
            // Esta CSP se escribió para el flujo antiguo (redirección), que no
            // pasa por la CSP porque es una navegación entera, y solo permitía
            // js.stripe.com. Resultado: el iframe del pago se quedaba bloqueado
            // y el carrito giraba para siempre sin llegar a pintar el pago.
            //
            // Dominios exigidos por Stripe (docs.stripe.com/security/guide):
            //   Stripe.js         → frame-src/script-src: js.stripe.com y *.js.stripe.com
            //   Embedded Checkout → frame-src/script-src/connect-src: checkout.stripe.com
            //                       img-src: *.stripe.com
            // El comodín *.js.stripe.com lo pide Stripe explícitamente: arrancan
            // los iframes en orígenes distintos para ganar rendimiento.
            //
            // seQura (simulador de cuotas, SequraSimulador.js): el script sale de
            // sequracdn y el widget consulta sequrapi para calcular las cuotas.
            // Sin estos dominios el navegador bloquea el script en silencio y el
            // «desde X €/mes» no aparece — no hay error de servidor y `curl` no lo
            // detecta, que es justo cómo se nos escapó el iframe de Stripe.
            // Se dejan sandbox y live: el entorno lo elige NEXT_PUBLIC_SEQURA_ENV.
            //
            // OJO CON LOS DOS DOMINIOS, que se parecen y no son lo mismo:
            //   sequraCDN.com → el JS del simulador          (script-src, img-src)
            //   sequraAPI.com → sus llamadas Y el FORMULARIO (connect-src, frame-src)
            // El formulario de identificación que incrusta PagoSequra.js sale de
            // `sandbox.sequrapi.com/orders/<uuid>/pumbaa_form`, y en frame-src solo
            // estaba el CDN: el iframe se quedaba en blanco y el cliente sin poder
            // pagar a plazos. Mismo fallo, mismo sitio y mismo síntoma invisible
            // que el iframe de Stripe de arriba — el tercero al que se le abre
            // connect-src casi nunca es el mismo al que hay que abrirle frame-src.
            value: "default-src 'self'; frame-src 'self' https://iframe.mediadelivery.net https://*.b-cdn.net https://js.stripe.com https://*.js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://tidycal.com https://*.tidycal.com https://sandbox.sequracdn.com https://live.sequracdn.com https://sandbox.sequrapi.com https://live.sequrapi.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.js.stripe.com https://checkout.stripe.com https://asset-tidycal.b-cdn.net https://www.googletagmanager.com https://invitejs.trustpilot.com https://sandbox.sequracdn.com https://live.sequracdn.com; connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://squatfit-api-cyrc2g3zra-no.a.run.app https://open.er-api.com https://api.frankfurter.app https://storage.googleapis.com https://*.b-cdn.net https://images.pexels.com https://tidycal.com https://*.tidycal.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://invitejs.trustpilot.com https://sandbox.sequrapi.com https://live.sequrapi.com https://sandbox.sequracdn.com https://live.sequracdn.com; img-src 'self' data: blob: https://*.stripe.com https://images.unsplash.com https://storage.googleapis.com https://www.google.com https://*.b-cdn.net https://iframe.mediadelivery.net https://images.pexels.com https://tidycal.com https://*.tidycal.com https://www.google-analytics.com https://*.google-analytics.com https://sandbox.sequracdn.com https://live.sequracdn.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
