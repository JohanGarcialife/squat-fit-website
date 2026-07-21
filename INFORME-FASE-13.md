# INFORME — FASE 13 (web pública + dashboard cliente)

**Rama:** `mejoras-landing-lote-3` (desde `main`, con la Fase 11 ya mergeada) · **Fecha:** 21-jul-2026
**Estado:** commit + push SIN mergear. Verificado contra el backend **ya desplegado** y en el build de revisión `:3002` (`NEXT_DIST=.next-rev`), móvil 375×812; desktop congelado (sin cambios de layout, comprobado sin regresión).

---

## 1) Flujo de tramos contra el backend real — VERIFICADO (con un hallazgo importante)

### Endpoints que quedaron activos (sondeados el 21-jul)

| Endpoint | Estado |
|---|---|
| `GET /api/v1/catalog` | ✅ ACTIVO — shape **agrupado** (ver abajo), 14 grupos, precios live |
| `POST /api/v1/catalog/checkout` | ✅ ACTIVO (1.ª candidata, como preveía la Fase 11) — **pero ver gap FRONTEND_URL** |
| `GET /api/v1/habits/state` | ✅ ACTIVO (401 sin token) |
| `POST /api/v1/habits/weekly-form` | ✅ ACTIVO (probado con usuario de prueba: calcula scores y semáforo) |
| `PUT /api/v1/habits/:habitId` | ✅ ACTIVO |
| `GET/PUT /api/v1/alerts/preferences` + `GET /alerts`, `/alerts/state`, `read`, `read-all` | ✅ ACTIVOS (roundtrip PUT→GET verificado) |
| `POST /api/v1/forms/public-answer` | ✅ ACTIVO (envío real → lead en BD) |

### El shape real del catálogo difiere del espejo → parsing ajustado

El endpoint NO devuelve filas planas: devuelve `{products: [{base, area, tiers: [{id, name, tier, price, billing_period, access_months, stripe_price_id, grant_type}]}]}`. Con el parser de la Fase 11 (sufijo «(mensual)» en `name`) **no matcheaba nada y la web seguía cayendo al espejo local**. Ajustes en `courseCatalog.js`:

- `groupTieredProducts()` acepta ambos shapes; con el real usa el campo `tier` explícito (importante: el tramo permanente de la biblioteca se llama «Biblioteca de recetas (de por vida)» — sin el campo `tier` no se podría agrupar).
- Nuevo tramo **`trimestral`** en `TIER_META` (solo lo trae «Biblioteca digital»); la exigencia de grupo completo sigue siendo el núcleo mensual/anual/permanente.
- `fetchTieredGroup(base)` para pedir un grupo concreto (lo usa la página de cocina), con el mismo fallback al espejo (que ahora incluye la biblioteca con los 4 precios reales).
- Verificado en Node y en navegador: **los items del carrito llevan los UUID reales de producto** (p. ej. mensual biblioteca `4954dfd1-…`), prueba de que pinta el catálogo live y no el espejo. Los 7 cursos salen con sus 3 tramos y precios live.

### Checkout → Stripe → vuelta a /cart — FUNCIONA, con gap de config en Cloud Run

- `POST /catalog/checkout` con el payload de la web devuelve **201 con `url` de Stripe Checkout LIVE + `session_id`** → redirect OK. La vuelta `/cart?success=true&session_id=…` pinta la **pantalla de gracias** (verificado en :3002).
- ⚠️ **Gap del deploy: `FRONTEND_URL` NO está definida en Cloud Run** (solo `HOST=https://squatfit-website.vercel.app`). Consecuencias:
  - El backend solo respeta `success_url`/`cancel_url` si su origin == `HOST` (fallback de validación).
  - Si las rechaza, su fallback interno construye `${FRONTEND_URL}/cart?…` = `undefined/cart…` → Stripe responde **400 «Invalid URL»**. Es decir: **el checkout solo funcionaba desde el dominio de Vercel**.
- Mitigación en la web (`createTierCheckout`): si llega ese 400, **reintenta una vez** con el origin conocido `https://squatfit-website.vercel.app` → el pago funciona desde cualquier origin (dominio propio futuro, build de revisión) y la vuelta cae en la misma app en Vercel. Verificado ejecutando el código real desde origin `localhost:3002`: 400 → retry → redirect a `checkout.stripe.com`. Si aun así fallara, `Payment.js` muestra el aviso honesto en lugar del error críptico en inglés.
- **Runbook (backend/infra):** añadir `FRONTEND_URL=https://squatfit-website.vercel.app` (o el dominio público definitivo cuando exista) a Cloud Run. Con eso el retry deja de ser necesario (queda como red de seguridad).
- No se completó ningún pago: solo creación de sesiones (caducan solas en 24 h).

## 2) Biblioteca digital con selector de tramos (cocina) — HECHO

- La tarjeta «Digital de por vida» de `/cocina#shop` ahora es **«Biblioteca digital»** con selector 2×2 **Mensual (9,99 €/mes) / Trimestral (34,99 €/trimestre) / Anual (89,99 € pago único · 12 meses) / De por vida (159 €)**, alimentada del grupo real del catálogo (`area: cocina`); por defecto «De por vida». CTA «Suscribirme» en tramos recurrentes.
- La compra va por el **checkout de tramos** (mismo flujo que los cursos), ya no por el endpoint viejo `create-payment-intent-digital` (que además tenía el precio permanente desactualizado: 149 € vs 159 € reales). El guard de «ya tienes de por vida» se mantiene.
- El «antes/ahorro» del bundle «Lo quiero todo» ahora se calcula con precios vivos (pack + biblioteca de por vida) cuando existen; si no, el estático de siempre.
- `CourseTierCard` soporta grupos de 4 tramos (2×2) por si se reutiliza.
- Verificado en :3002 a 375×812 (captura OK) y DOM desktop (grid de 4 intacto).

## 3) Prellamada — VERIFICADO con envío real

- Envío real por `POST /forms/public-answer` (form_id prellamada) → **201** con `submission_id 507f6d18-…` y **lead creado en BD**: `leads.id = 9734a256-3a57-4d9f-93a6-f2e7902c874a`, nombre **«Prueba Fase 13 (borrar)»**, tel +34600000013, status `nuevo`. → **Para el panel/CRM: borrar o descartar ese lead de prueba.**
- La pantalla de gracias YA muestra el **BOOKING_URL real**: `https://agenda.squatfit.es/sesion-diagnostica` (TidyCal, responde 200). Sin cambios de código necesarios.
- Nota: en `/programa`, `ProgramPricing.BOOKING_URL` sigue vacío **a propósito**: el CTA lleva al formulario de prellamada y ES la pantalla de gracias la que ofrece agendar (funnel: form → llamada). Si se quisiera saltar el form, bastaría pegar ahí el link.

## 4) Dashboard cliente — Alertas conectada al motor de hábitos

`/panel-alertas` ahora consume `GET /api/v1/habits/state` además de las alertas:

- **Semáforo semanal**: color+etiqueta del backend (verde/amarillo/naranja/rojo), score global y los 3 parciales (adherencia/recuperación/estrés), acciones sugeridas y los ajustes de hábitos decididos por el motor esa semana.
- **Histórico 12 semanas**: mini gráfico de barras (altura = score 1–5, color = semáforo de cada semana).
- **Hábitos activos**: lista con toggle (PUT `/habits/:id`); los `locked` se muestran como «Fijo». Al pausar se avisa del cooldown de 7 días.
- **Form semanal existente** enlazado: CTA «Actualizar mi seguimiento semanal» → `/formulario/seguimiento-semanal` (que ya postea a `habits/weekly-form`). Si el usuario aún no tiene datos: estado vacío con CTA al primer check-in.
- **Ajustes → Notificaciones**: el backend SÍ expone preferencias (`/alerts/preferences`): se añadieron los toggles por categoría/canal en `panel-ajustes` con un componente compartido (`NotificationPrefs.js`) que también usa Alertas — ambos tocan las mismas preferencias. Gap menor documentado: el backend devuelve además `quiet_hours_start/end` que la UI no expone todavía.
- Verificación: el flujo completo se probó **a nivel de API** con un usuario de prueba (`prueba.claude.envio2@example.com`): weekly-form → scores/semáforo (W30, amarillo «Progreso sostenible») → state con histórico y hábitos → roundtrip de preferencias (restauradas). La verificación clicando la UI autenticada no fue posible en esta sesión (el clasificador de permisos bloqueó inyectar la sesión forjada en el navegador); el build compila y las páginas consumen exactamente los campos verificados. Queda a un login del usuario verlo pintado.

---

## Datos raros de PROD vistos de pasada (fuera de este lote)

- En `/cocina#shop`, la tarjeta impresa simple sale como «Libro de cocina 1» a **1000 €** y el pack como «Nutricion» a 80 €: los datos de libros/packs de prod no tienen ningún producto que matchee «Vol 1» / «Vol 1 y 2», y el fallback pinta lo primero que hay. Es dato, no código de este lote — revisar el catálogo de libros/packs en el panel.

## Cómo verificar (build de revisión, ya arrancado en :3002)

```bash
kill $(lsof -ti:3002); NEXT_DIST=.next-rev npm run build; NEXT_DIST=.next-rev PORT=3002 HOSTNAME=0.0.0.0 npm start
```

- `/cocina#shop` → tarjeta Biblioteca digital con 4 tramos y precios live; «Suscribirme» (mensual) → carrito → pago → Stripe (no pagar).
- `/cursos` → tarjeta Fuerte y Definid@ con 3 tramos live (27,50 / 187,99 / 346).
- `/cart?success=true&session_id=x` → pantalla de gracias.
- `/empieza-tu-cambio` → completar → gracias con «Reservar mi llamada» (agenda.squatfit.es).
- Con sesión: `/panel-alertas` (semáforo + hábitos + histórico + preferencias) y `/panel-ajustes` (Notificaciones).
