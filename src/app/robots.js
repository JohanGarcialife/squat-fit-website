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
          // El quiz del downsell. No es una página que venda a quien llega de
          // Google: es el final de una conversación concreta, con su copy
          // aprobado y sus precios propios (la videoconsulta sale a 99,97 desde
          // 160). El equipo lo manda enlazado —`?c=1100&o=GM&via=karl`—, y ese
          // `via` es además quien se lleva la atribución de la venta. Suelto en
          // el buscador ofrecería ese precio a cualquiera y sin nadie detrás.
          // Misma razón por la que ya están fuera `/r/` y `/formulario/`.
          '/recomendador',
        ],
      },
    ],
    sitemap: 'https://squadfit.es/sitemap.xml',
  };
}
