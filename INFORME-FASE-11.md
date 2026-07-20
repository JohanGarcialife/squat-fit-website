# Informe Fase 11 — Web (20 jul 2026)

Rama: `mejoras-landing-lote-2` (actualizada desde `origin/main` antes de empezar: fast-forward limpio hasta el merge del PR #12).
Todo verificado en el build de revisión (`:3002`, `NEXT_DIST=.next-rev`), que queda **arrancado y sirviendo estos cambios**. **No se ha mergeado, ni desplegado, ni tocado Stripe, ni completado ninguna compra real.**

## Contexto clave: la Fase 9 aún no ha publicado

Antes de tocar nada se verificó el estado real del backend (prod + repo `SquatFit` con `git fetch --all`):

- `GET /api/v1/catalog` → **404 en prod** y sin rastro en ninguna rama del repo backend.
- No existe ningún checkout que acepte productos del catálogo (el actual solo admite `version/pack/course/calculator`, vía PaymentIntent).
- No hay `INFORME-FASE-9.md` ni rama nueva: la Fase 9 corre en paralelo y no ha pusheado todavía.

Por eso TODO lo de esta fase se ha montado con **detección en vivo** (estilo `REDIRECTS_API_READY`, pero automática): la web usa el backend real en cuanto exista **sin necesitar otro deploy del front**, y mientras tanto se comporta exactamente igual que antes.

## 1. Catálogo real (PRODUCTS_ENDPOINT) — ENCENDIDO con fallback

`src/app/components/courseCatalog.js`:

- `PRODUCTS_ENDPOINT = ${NEXT_PUBLIC_API_URL}/api/v1/catalog` (el GET de la Fase 9).
- `fetchTieredCourses()` acepta tanto un array directo como envoltorios habituales (`products`/`catalog`/`items`/`rows`/`data`) — el shape exacto lo decide la Fase 9 y no lo conocemos aún.
- **Fallback**: si el endpoint da 404, la red falla, el shape no trae grupos completos o algún precio no es sano (>0), se sigue usando el espejo local 15.1. La tienda nunca se queda en blanco ni pinta precios rotos.

Verificado en navegador (build :3002): el fetch a `/api/v1/catalog` se dispara, recibe 404 (CORS OK, status legible), y `/cursos` pinta la tarjeta de Fuerte y Definid@ con sus 3 tramos (27,50/187,99/346) y `/panel-cursos` las 7 tarjetas del catálogo — es decir, fallback intacto.

## 2. Cobro de tramos (TIER_CHECKOUT_ENDPOINT) — CONECTADO con detección 404

Como la Fase 9 no ha publicado la ruta del checkout, se prueban **candidatas en orden** (constante `TIER_CHECKOUT_ENDPOINTS`):

1. `/api/v1/catalog/checkout`
2. `/api/v1/checkout/catalog`
3. `/api/v1/checkout/create-checkout-session`
4. `/api/v1/products/checkout`

Nueva `createTierCheckout(item, {token})` en `courseCatalog.js`, usada por `Payment.js` cuando el item directo es un curso con tramo (detectado por `tier`/`tierGroup`, **ignorando el campo `endpoint` persistido en carritos viejos**):

- **404 en todas las candidatas** (= Fase 9 sin desplegar) → se mantiene la pantalla honesta «La compra online de este curso se activa muy pronto». Es lo que pasa HOY (verificado: las 4 rutas devuelven 404 desde el navegador).
- **Respuesta con `url`** (Stripe Checkout Session; se aceptan `url`/`checkout_url`/`session_url`/`sessionUrl`/`session.url`) → redirección a Stripe. Payload enviado: `{ items: [{product_id, product_name, billing_period, quantity: 1}], success_url: /cart?success=true, cancel_url: /cart, origin }` con Bearer token. `product_name` («Fuerte y Definid@ (anual)») es la clave estable; `product_id` llevará el UUID real cuando el catálogo venga del backend.
- **Respuesta con `clientSecret`** → se monta el Payment Element de siempre (por si la Fase 9 optara por PaymentIntent en vez de Checkout Session).
- **Error real (400/401/500)** → toast con el mensaje del servidor.

La vuelta de Stripe ya estaba resuelta: `/cart?success=true` (y `redirect_status=succeeded`) → pantalla «¡Pago confirmado!» + carrito vaciado.

Verificado en navegador con dos recorridos completos (sesión forjada en localStorage, sin red real de pago):
- **Flujo actual (sin Fase 9)**: carrito → datos → paso 3 → las 4 candidatas dan 404 → pantalla «muy pronto». ✔
- **Flujo futuro (simulando la Fase 9)**: stub de `fetch` devolviendo `{url}` en la primera candidata → el paso 3 redirige a la «Checkout Session», vuelve a `/cart?success=true` → «¡Pago confirmado!» y carrito vacío. ✔

## 3. Prellamada (/empieza-tu-cambio) — verificada, sin cambios

- El POST sigue yendo a `POST /api/v1/forms/public-answer` con `form_id f0a11e00-…0001` (encendido en el commit anterior de la rama).
- El endpoint **está desplegado en prod**: body inválido → 400 de validación (no 404), y un POST completo con el **honeypot relleno** (campo `website`, que el backend acepta con 201 `{received:true}` pero NO guarda) confirma la ruta end-to-end sin ensuciar datos. Cuando la Fase 9 haga que cada envío cree un lead, la web no necesita cambios.
- El formulario renderiza bien en el build de revisión.

## 4. Repaso

- **Capturas de ~/Desktop**: solo las dos del 18 jul ya analizadas y corregidas en fases anteriores (onboarding en masculino y /activate sin estilos). Sin feedback nuevo.
- **Scroll del carrito 3.3 en iPhone**: verificado en viewport 375×812 — /cocina scrolleada a y=1800 → pop-up → «Finalizar compra» → /cart → atrás → vuelve a /cocina restaurando ~y=1800 (retorno guardado en `sqf-cart-return`). ✔
- Sin errores de consola en las páginas tocadas. Build de producción limpio.
- Estado forjado de las pruebas (sesión + carrito en el navegador de revisión) limpiado al terminar.

## Decisiones tomadas (autónomas)

1. **Rutas candidatas del checkout**: la Fase 9 no ha pusheado y no hay contrato escrito, así que en vez de una constante muerta se prueban 4 rutas plausibles en orden y un 404 en todas = «aún no». Si la Fase 9 elige otra ruta, basta añadirla/ponerla primera en `TIER_CHECKOUT_ENDPOINTS` (1 línea). Un 404 de NestJS en ruta inexistente responde antes de guards, así que la detección no depende del token.
2. **Doble tolerancia en la respuesta del checkout** (`url` → redirect; `clientSecret` → Payment Element) para no depender de qué flujo Stripe elija la Fase 9.
3. **Los items viejos del carrito** (persistidos con `endpoint: null` de la Fase 5) se detectan por `tier`/`tierGroup` y usan la detección en vivo — nadie se queda atascado en «muy pronto» por tener el carrito guardado de antes.
4. **Espejo local como validador**: el catálogo remoto solo sustituye al espejo si trae grupos completos (3 tramos) con precios > 0; cualquier otra cosa cae al espejo. Preferimos precios locales correctos a datos remotos a medias.
5. El POST de verificación de la prellamada se hizo **con el honeypot relleno a propósito** para no crear un envío real en la BD de prod.

## Qué queda tras detección (se enciende solo, sin tocar el front)

| Pieza | Estado hoy | Cuándo se enciende |
|---|---|---|
| Catálogo real en tienda (`/cursos`, `/panel-cursos`, carrito) | Espejo local 15.1 | En cuanto `GET /api/v1/catalog` responda 200 con las filas de products |
| Cobro de tramos (redirect a Stripe Checkout) | Pantalla «muy pronto» | En cuanto una ruta candidata deje de dar 404 |
| Leads desde la prellamada | El POST ya llega a prod | Lado backend (Fase 9); la web no cambia |

**Única atención manual posible**: si la Fase 9 publica el checkout en una ruta que no esté entre las 4 candidatas, añadirla a `TIER_CHECKOUT_ENDPOINTS` en `courseCatalog.js`. Y cuando el catálogo real responda, conviene un vistazo de 1 minuto a `/cursos` para confirmar que los UUID llegan a `product_id`.

## Cómo verificar (build de revisión, ya arrancado en :3002)

```bash
kill $(lsof -ti:3002); NEXT_DIST=.next-rev npm run build; NEXT_DIST=.next-rev PORT=3002 npm start
```

1. `/cursos` → tarjeta F&D con selector de 3 tramos y precios 15.1 (fallback mientras no haya catálogo).
2. Con sesión: comprar → paso 3 → pantalla «muy pronto» (hoy). En la consola de red se ven los 4 POST con 404.
3. `/empieza-tu-cambio` → completar → el POST va a `/forms/public-answer` (201).
4. En iPhone: /cocina scrolleada → carrito → atrás → el scroll vuelve a donde estaba.
