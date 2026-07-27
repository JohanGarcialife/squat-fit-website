// robots.txt del lanzamiento: indexable todo lo público; fuera el panel del
// cliente, el carrito y flujos privados. El sitemap lo genera app/sitemap.js.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/panel-control',
          '/panel-cursos',
          '/panel-cocina',
          '/panel-ajustes',
          '/panel-alertas',
          '/panel-contacto',
          '/panel-info',
          '/panel-planes',
          '/mi-programa',
          '/mi-entreno',
          '/profile',
          '/profile-panel',
          '/cart',
          '/onboarding',
          '/formulario/',
          '/activate',
          '/PaymentSuccess',
          '/r/',
        ],
      },
    ],
    sitemap: 'https://squadfit.es/sitemap.xml',
  };
}
