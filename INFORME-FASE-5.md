# Informe Fase 5 — segunda pasada (20 jul 2026)

Rama: `mejoras-landing-lote-2` (actualizada desde `origin/main` antes de empezar, fast-forward limpio).
Todo verificado en el build de revisión (`:3002`, `NEXT_DIST=.next-rev`). **No se ha tocado `main` ni se ha desplegado nada.**

Las dos capturas del Desktop (18 jul) eran las mismas ya analizadas en la Fase 1 (onboarding en masculino y `/activate` sin estilos, ambas ya corregidas en la rama). No había feedback nuevo.

## Qué se hizo (las 7 tareas, completadas)

### 1. Cookies v2 (13.6)
- `CookieBanner.js`: el banner pasa a **3 acciones** — «Aceptar» (todo, analítica incluida), «Rechazar» (solo esenciales) y «Saber más» (→ `/politicas?tab=cookies`). El panel de preferencias se abre desde el enlace «preferencias» del propio texto.
- Nueva categoría **«Analítica (Google)»** en preferencias: interruptor desactivado por defecto, con botón «Guardar preferencias». La elección se persiste en `sqf-cookie-consent` como `{choice, analytics, date}` (`accepted`/`rejected`/`custom-*`). Exportados `getCookieConsent()` y `analyticsAllowed()` para condicionar la carga de GA4/Site Kit cuando se instale (consent mode: denegado por defecto).
- Tabla de la política de cookies (`LegalContent.js`): añadidas `_ga` y `_ga_<id>` con etiqueta naranja **«solo si activas analítica»**, y `sqf-cookie-consent` a la fila de almacenamiento propio. Copy de la política actualizada (ya no dice «no usamos analítica» a secas: dice que está desactivada por defecto y se activa solo a elección del usuario).
- Verificado en navegador: Aceptar → `analytics: true`; Rechazar → `analytics: false`; Guardar preferencias con el interruptor activado → `custom-analytics`; el banner no reaparece; la tabla pinta las 2 filas de GA con su etiqueta.

### 2. Tienda con tramos (15.1 front)
- **Contexto verificado a fondo (backend prod + repo SquatFit local)**: el catálogo 15.1 está en la tabla `products` con `billing_period` y `access_months`, pero **no existe todavía endpoint público que lo liste** (solo `GET /admin-panel/products`, restringido a staff por middleware de roles) **ni un checkout que acepte productos del catálogo** (el actual solo admite `version/pack/course/calculator`). `course/all` sigue devolviendo 4 cursos de prueba sin tramos.
- Nuevo módulo **`courseCatalog.js`**: `groupTieredProducts()` agrupa filas de `products` por nombre base + sufijo «(mensual)/(anual)/(permanente)»; `PRODUCTS_ENDPOINT` (hoy `null`) listo para encender cuando el backend exponga el catálogo; mientras, **espejo local exacto del catálogo 15.1 real** (7 cursos × 3 tramos, mismos nombres y precios que dejó el seed en la BD de prod). `TIER_CHECKOUT_ENDPOINT` (hoy `null`) para el cobro.
- Nueva **`CourseTierCard.js`**: UNA tarjeta por curso con selector **Mensual / Anual / De por vida** — mensual «X €/mes · Suscripción, cancela cuando quieras», anual «pago único · 12 meses de acceso», permanente «pago único · acceso para siempre».
- Aplicado en:
  - **Compra directa** (`/cursos`, `CTO.js`): la tarjeta de Fuerte y Definid@ con los 3 tramos y precios reales (27,50/187,99/346) sustituye a las 3 tarjetas antiguas con precios desactualizados (27,47/197,94/346,36) y payload de pago inválido.
  - **Tienda del panel** (`panel-cursos` sin suscripción): nueva `CourseTierShop.js` con las 7 tarjetas del catálogo (F&D destacado primero) + enlace de refrescar acceso. Sustituye a la tarjeta de marketing sin precios.
  - **Carrito**: el item lleva su grupo entero → en `/cart` se puede **cambiar de tramo desde el propio carrito** (selector «Período» como el de Cocina digital, con precios por tramo); el pop-up del carrito muestra la nota del tramo y oculta los botones de cantidad (un acceso no tiene unidades); el resumen del pedido etiqueta el tramo y trata el mensual como recurrente.
- **Cobro**: al no existir endpoint, el paso de pago muestra una pantalla honesta «La compra online de este curso se activa muy pronto» con mailto, en lugar del error críptico de Stripe que daba antes (la compra de cursos de /cursos YA estaba rota en prod: mandaba `course_id: 'monthly'` a un endpoint que exige UUID).
- Verificado en navegador: selector en /cursos (3 tramos con su precio y copy), compra → carrito con «Fuerte y Definid@ — De por vida 346 €», cambio a Anual desde el carrito (187,99 + «12 meses de acceso»), paso 2 con resumen correcto y paso 3 con el aviso honesto. Tienda del panel con las 7 tarjetas.

### 3. Formulario semanal → motor de hábitos
- `/formulario/seguimiento-semanal` ahora hace **`POST /api/v1/habits/weekly-form`** con el token de sesión y el body del DTO exacto (las 9 escalas 1–5 + `weekly_weight_kg` numérico opcional + `week_id` ISO).
- `FormRunner` acepta `renderResult`: la pantalla final del semanal muestra el **semáforo** (emoji + `semaphore_label` + color), la **puntuación global** y los 3 scores (adherencia/recuperación/estrés), las **sugerencias** (`suggested_actions`), los hábitos activados (`decisions`) y la **semana** (`week_id`), con CTA **«Ver mis alertas y hábitos» → `/panel-alertas`**.
- La copia en localStorage se mantiene siempre (`sqf-form-seguimiento-semanal`: respuestas + scores del cliente + respuesta del motor). Si el POST falla, pantalla de respaldo «Respuestas guardadas» avisando de que no se pudo conectar.
- Evaluación inicial y revisión mensual **sin cambios** (siguen tras `BACKEND_FORM_IDS`, que llegará de la Fase 6 — no se ha inventado).
- Verificado: recorrido completo de las 11 pantallas, POST disparado al endpoint real (401 con el token de prueba, esperado), copia local con `week_id 2026-W30` y scores correctos, pantalla de respaldo. **La pantalla de semáforo con datos reales queda pendiente de un ojo con cuenta real** (no hay credenciales de cliente en esta máquina y no era cuestión de crear cuentas).

### 4. Eliminar cuenta (13.10 front)
- Nueva **«Zona de peligro»** en Ajustes (tarjeta con borde rojo, copy honesto: irreversible, borra todos los datos, cancela suscripciones).
- Modal de **doble confirmación**: hay que escribir `ELIMINAR` y el email de la cuenta (insensible a mayúsculas; el campo vacío nunca pasa, aunque `user/info` fallara). Botón «Eliminar para siempre» deshabilitado hasta cumplir ambas.
- Confirmado → **`DELETE /api/v1/user/account/gdpr`** (antes iba al `/user/account` antiguo) → **pantalla de despedida** (se pinta antes del logout para que no la tape el aviso de acceso) → logout → botón «Volver al inicio».
- Verificado en navegador: estados del botón (vacío/solo ELIMINAR/email equivocado → deshabilitado; ambos correctos → habilitado). El DELETE real no se ha ejecutado (habría borrado una cuenta de verdad).

### 5. Normalización de nombres (15.16 front)
- Nuevo `nameUtils.js` con `normalizeName()`: Primera Mayúscula por palabra, partículas **de/del/la/las/los/y** en minúscula (salvo si son la primera palabra del campo), espacios colapsados, y soporte de guiones y apóstrofos («Martínez-García», «O'Brien»).
- Aplicado **solo al enviar** (nunca mientras teclea) en los 6 puntos: `register` (antes del split nombre/apellidos), `onboarding` (PUT user/update), `/empieza-tu-cambio` (first_name/last_name del submission), `contacto` (nombre en el ticket), Empleo (Conócenos → Únete al equipo) y `profile-panel` (PUT user/update).
- Verificado con casos unitarios: `maría GARCÍA lópez → María García López`, `juan DEL río → Juan del Río`, `ana de los ángeles → Ana de los Ángeles`, `de la fuente → De la Fuente` (apellido suelto).
- Nota asumida: el resto de cada palabra se pasa a minúscula (así «MARÍA» queda bien); grafías tipo «McDonald» pierden la mayúscula interna — caso residual, preferible a dejar los gritos del teclado móvil.

### 6. /programa: agenda embebida con UTM
- Nueva `AgendaSection.js` (sección `#agenda` entre precios y garantía): **iframe responsive** de `https://agenda.squatfit.es/sesion-diagnostica` (alto `min(720px, 85vh)`) que **reenvía los UTM de la URL actual** (`utm_source/medium/campaign/term/content`) como query params, y **enlace de respaldo** siempre visible («¿No ves la agenda? Ábrela en una pestaña nueva») que se convierte en botón grande si el iframe falla.
- Comprobado que la agenda (TidyCal con dominio propio) **no envía X-Frame-Options ni CSP frame-ancestors** → es embebible. Ojo: responde 404 a peticiones HEAD (rareza de TidyCal), pero el GET es 200.
- Verificado: `/programa?utm_source=instagram&utm_campaign=fase5&utm_medium=bio` → iframe con `?utm_source=instagram&utm_medium=bio&utm_campaign=fase5`, sección y enlace presentes, petición del iframe disparada. (El panel de captura no compone iframes cross-origin en el pantallazo; el DOM y la red lo confirman. Merece un vistazo de 10 s en un navegador normal.)

### 7. /r/[slug] (13.7 front)
- Nuevo route handler `src/app/r/[slug]/route.js`: consulta `GET {API}/api/v1/redirects/{slug}` (sin caché, acepta `destination|url|target`) y responde **302 real** al destino.
- El endpoint aún no existe en prod (verificado: 404) → **`REDIRECTS_API_READY = false`** y se sirve un **404 amable** con la marca (tarjeta, «Este enlace no existe (aún)», botón a la home, `noindex`) sin tocar la red. Para encender: cambiar la constante a `true`.
- Verificado: `/r/loquesea` → 404 con la página amable.

## Decisiones tomadas (autónomas)
1. **Catálogo de tramos sin endpoint público**: se verificó exhaustivamente (rutas del backend desplegado, middleware, repo local en `features-lote-4` = main) que los `products` con `billing_period`/`access_months` solo se sirven a staff. Antes que inventar un endpoint o degradar la tarea, el front queda **funcionalmente completo** con espejo local de los datos reales de la BD y dos constantes (`PRODUCTS_ENDPOINT`, `TIER_CHECKOUT_ENDPOINT`) para conectar el catálogo y el cobro reales en cuanto existan (Fase 6). La agrupación por sufijo ya es la definitiva.
2. **Paso de pago de tramos**: pantalla honesta de «muy pronto» + mailto en lugar de dejar que Stripe falle (que era el comportamiento previo de /cursos, roto silenciosamente).
3. **Banner de cookies**: «Preferencias» dejó de ser botón principal (la tarea pide 3 acciones); vive como enlace en el texto del banner. «Aceptar» activa también la analítica; «Rechazar» = solo esenciales.
4. **Zona de peligro**: la pantalla de despedida se renderiza con estado local *antes* del logout (si no, el guard de sesión la taparía). Endurecido el caso de email vacío.
5. **`/r/[slug]` como route handler** (no página): es la única forma de emitir un 302 real; el 404 amable va como HTML embebido con la estética de la marca.
6. **Normalización**: partículas exactamente las de la tarea (de/del/la/las/los/y); el resto de la palabra se pasa a minúscula (documentado arriba).
7. **RichProductCards en panel-cursos** sustituida por la tienda real con precios: era una tarjeta de marketing que mandaba a /cursos; ahora el panel vende directamente. La componente sigue existiendo para otros usos.

## Pendientes / para revisar
- **Fase 6 (backend)**: cuando exista el endpoint público del catálogo y el checkout de productos con tramos, poner `PRODUCTS_ENDPOINT` y `TIER_CHECKOUT_ENDPOINT` en `courseCatalog.js` (y revisar el shape del payload de `buildTierCartItem`). Igual con `REDIRECTS_API_READY = true` en `src/app/r/[slug]/route.js` cuando se despliegue `/api/v1/redirects/{slug}`.
- **Ojo con cuenta real (2 min)**: enviar el seguimiento semanal con una sesión de verdad y ver la pantalla de semáforo con datos del motor; y comprobar la sección de la agenda en /programa en un navegador normal (el pantallazo del panel embebido no compone iframes cross-origin).
- **GA4/Site Kit**: al instalarlo, condicionar la carga a `analyticsAllowed()` de `CookieBanner.js` (consent mode ya preparado).
- El borrado GDPR real no se ha ejecutado de punta a punta (habría destruido una cuenta); el modal, el endpoint y la pantalla de despedida están cableados y verificados hasta el click final.
- `BACKEND_FORM_IDS` (evaluación inicial / revisión mensual) sigue esperando los form_id de la Fase 6, como estaba.

## Cómo verificar cada punto (build de revisión)
```bash
kill $(lsof -ti:3002); NEXT_DIST=.next-rev npm run build; NEXT_DIST=.next-rev PORT=3002 npm start
```
1. **Cookies**: borrar `sqf-cookie-consent` de localStorage y recargar la home → banner con Aceptar/Rechazar/Saber más; «preferencias» (en el texto) → interruptor de Analítica. `/politicas?tab=cookies` → tabla con `_ga` marcadas.
2. **Tramos**: `/cursos` (tarjeta F&D con selector), `/panel-cursos` sin suscripción (tienda con 7 cursos), comprar → en `/cart` cambiar el período desde el desplegable; paso 3 → aviso «muy pronto».
3. **Semanal**: con sesión, `/formulario/seguimiento-semanal` → al enviar, pantalla de semáforo con sugerencias y enlace a Alertas (o «Respuestas guardadas» si no hay red).
4. **Eliminar cuenta**: Ajustes → Zona de peligro → el botón del modal solo se habilita con ELIMINAR + email exacto.
5. **Nombres**: registrarse como «maría GARCÍA» → el perfil guarda «María García» (o guardar el perfil/contacto/empleo).
6. **Agenda**: `/programa?utm_source=x&utm_campaign=y` → sección «Reserva tu llamada» con el iframe llevando esos parámetros.
7. **Redirects**: `/r/cualquier-cosa` → 404 amable (302 cuando se encienda el flag).
