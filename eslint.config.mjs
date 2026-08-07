import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';

/**
 * ESLint del sitio público.
 *
 * ── POR QUÉ SE INSTALA (6-ago-2026) ─────────────────────────────────────────
 *
 * Se rompió el «Guardar dirección» del carrito en producción con un
 * `valores is not defined`: al partir un componente en dos, una función se
 * quedó leyendo una variable que ya no existía en su ámbito. El código era
 * JavaScript perfectamente válido, así que `next build` pasó sin una queja —
 * ese error solo aparece cuando alguien pulsa el botón. Un cliente pulsó.
 *
 * Esa clase de fallo la caza `no-undef` en menos de un segundo. El repo no
 * tenía ESLint: `next lint` desapareció en Next 16 y nadie puso el reemplazo.
 *
 * ── QUÉ HACE Y QUÉ NO ───────────────────────────────────────────────────────
 *
 * `no-undef` en ERROR, y es la única que bloquea. A propósito: distingue «esto
 * no se sostiene en ningún caso» de «esto se podría escribir más bonito».
 *
 * Los plugins de hooks y de Next SÍ están, pero solo como avisos. Se registran
 * sobre todo porque el código ya lleva comentarios `eslint-disable-next-line
 * react-hooks/exhaustive-deps`: sin el plugin cargado, ESLint da error por
 * referirse a una regla que no conoce, y 30 ficheros se quejarían de algo que
 * no es un problema. No se usa el preajuste `next/core-web-vitals` porque su
 * puente al formato nuevo revienta con un error de estructura circular.
 *
 * El resto de reglas van en `warn`: en un repo de este tamaño, poner el estilo
 * en error significa o dedicar una tarde a incendios que no queman, o que
 * alguien acabe desactivando el lint entero. Las dos acaban igual: sin red.
 *
 * ── CÓMO SE USA ─────────────────────────────────────────────────────────────
 *
 *   npm run lint        → solo lo que bloquea (esto es lo que hay que mirar)
 *   npm run lint:todo   → con los avisos incluidos
 *   npm run lint:fix    → arregla lo que se puede solo
 */
export default [
  js.configs.recommended,

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.next-*/**',
      'out/**',
      'public/**',
      // Copias enteras del repo —con sus builds dentro— que crean las sesiones
      // de trabajo. Sin esta línea, `npm run lint` devuelve 4.100 errores del
      // bundle MINIFICADO (`self is not defined`, columnas de seis cifras) y
      // los de verdad quedan enterrados. Ya está en .gitignore; faltaba aquí.
      '.claude/**',
      'next.config.mjs',
      'eslint.config.mjs',
    ],
  },

  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: { 'react-hooks': reactHooks, '@next/next': next },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        // Navegador
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        MutationObserver: 'readonly',
        AbortController: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
        AbortSignal: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        getComputedStyle: 'readonly',
        matchMedia: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        // Temporizadores
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        queueMicrotask: 'readonly',
        // Comunes a los dos lados
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        structuredClone: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        // Cargados por <script> de terceros
        gtag: 'readonly',
        dataLayer: 'readonly',
        fbq: 'readonly',
        Tally: 'readonly',
        Sequra: 'readonly',
        Stripe: 'readonly',
        // JSX moderno
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    rules: {
      // ── LA QUE BLOQUEA ──
      'no-undef': 'error',

      // Los espacios duros (NBSP) dentro de textos SON intencionados: mantienen
      // unidos «12 €» o «Vol. 1» para que no se partan al final de una línea.
      // La regla solo debe cazarlos donde sí son un error: en el código.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipComments: true, skipJSXText: true },
      ],

      // ── AVISOS: informan, no paran ──
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-constant-binary-expression': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'off',
    },
  },
];
