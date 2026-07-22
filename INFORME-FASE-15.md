# INFORME — FASE 15 (web pública + carrito)

**Rama:** `mejoras-landing-lote-4` (desde `origin/main` d00de2e, 22-jul-2026). **Sin mergear.**
**Calidad:** `npm run build` limpio (Turbopack) + verificación visual/funcional en `:3002` (móvil 375×812; desktop congelado, solo se añadió una sección nueva).

---

## 1) Prueba social reorganizada

- **`/programa` ya no tiene `<PlanesTestimonials>`** (componente borrado). Las 5 personas que
  salían ahí (Elena Armada, Manuel López, Ana Béjar, Diego Villaroel, Ane Ayerbe) **ya estaban
  todas** en las reseñas de `/cursos` con copys de sabor "curso", así que no se perdió a nadie.
- `/cursos` (`Testimonials.js`): reseñas de curso (8 personas). `/cocina` (`TestimonialsCocina.js`):
  reseñas de recetas (9 personas). En ambos ficheros las constantes quedan marcadas con el
  comentario **«PENDIENTE de confirmación de cada persona»**. No se inventó ninguna persona ni
  ningún copy nuevo: se conservaron los textos ya existentes (reales, ya adaptados al contexto).

## 2) Sección Transformaciones en /programa

- Nuevo `programa/_components/Transformaciones.js`, colocado **donde estaba PlanesTestimonials**
  (justo antes de `<TrustpilotPrograma>`). Patrón slick idéntico a TrustpilotPrograma
  (`useSlickWrapSpeed`, centerMode, 1 tarjeta en móvil / 3 en ≥1280, flechas naranjas, realce de
  la tarjeta central).
- Tarjeta = **par antes/después** (las fotos llegaron como pares separados, no imagen combinada):
  dos fotos lado a lado con etiquetas «Antes» (gris) / «Después» (naranja), nombre y «en N meses».
  Cabecera en marca: «TRANSFORMACIONES / Cambios reales, personas reales».
- Personas y meses: Rocío Maseda (6), Javier Contreras (10), Azize Pratt (5), Luis Benito (7),
  Manuel Sánchez (4).
- **Fotos:** estaban ya en `public/transformaciones/` con nombres sin normalizar («Rocio Maseda B
  Antes.jpg», «Luis Benito Despes.jpg»…) y hasta 4,9 MB. Se generaron copias con los slugs pedidos
  (`<slug>-antes.jpg` / `-despues.jpg`), redimensionadas a máx. 1200 px y calidad 78 (150–400 KB
  cada una) — **esas 10 son las que se commitean**. Decisiones: las fotos reales son 4:5 (1920×2400),
  así que la tarjeta usa `aspect-[4/5]` en lugar del 3:4 previsto para placeholders; los originales
  pesados y los pares viejos (ana/diego/jesica/manuel, de otra tanda) quedan **sin trackear** en la
  carpeta local por si se quieren reutilizar.

## 3) Agenda

No tocada (ya la dejó hecha el coordinador con el widget TidyCal inline). Verificada de pasada al
recorrer /programa: sin errores en consola.

## 4) Aranceles USA en el carrito (solo mostrar)

- Nueva utilidad `src/app/(cart)/_components/aranceles.js`: `arancelUSA(valor)` con la tabla por
  tramos (≤25→1,95 … ≤2400→27,10), `subtotalFisicos(cart)` (físicos = items sin `isDirectCheckout`)
  y `arancelParaCarrito(cart, country)`. **Decisión:** por encima de 2.400 € de valor declarado se
  aplica el importe máximo de la tabla (27,10) en vez de ocultar la línea; la Fase 16 puede refinarlo.
- **`Summary.js` (paso 1):** línea «Aranceles (EE. UU.)» entre «Envío» y «Total», sumada al Total.
  El país sale del checkout persistido (por defecto `ES` → no aparece hasta que el cliente haya
  puesto EE. UU. en el paso 2).
- **`OrderSummary.js` (pasos 2 y 3):** cuando hay arancel se desglosan «Envío» y «Aranceles
  (importación EE. UU.)» encima de «Hoy pagarás», y el arancel **se suma** a ese total.
- **`CheckoutForm.js`:** el país del formulario se sincroniza en vivo al store (`updateFormData`)
  para que el resumen reaccione al momento al cambiar de país (verificado: US ↔ ES).
- Solo USA + físicos: carrito 100 % digital o país ≠ US → ni línea ni suma (verificado). Sobre el
  IVA: los precios ya van con IVA incluido y no existe línea de IVA separada en el resumen; la de
  aranceles queda como línea propia, aparte del envío, como pedía la tarea. **El cobro real del
  arancel llega con la Fase 16** (hoy el PaymentIntent del backend no lo incluye — anotado abajo).

Verificación en :3002 (libro físico de 39,99 € + país US): Subtotal 39,99 · Envío 4,99 ·
Aranceles 2,35 (tramo ≤50) · Total/«Hoy pagarás» 47,33 €, en paso 1 y paso 2.

## 5) Low-sev restantes de la auditoría (web)

Hechos:
- **#13 Banner «envío gratis» en carritos 100 % digitales** (`Summary.js`): el bloque solo se pinta
  si hay físicos en el carrito.
- **#14 Cambio de periodo en digitales legados hereda el payload del tramo anterior**
  (`Summary.js`): al cambiar de periodo se limpian `endpoint`/`payload`; si el item legado
  llega al pago sin endpoint, Payment ya muestra el aviso honesto de «se activa muy pronto» en vez
  de cobrar el tramo viejo con el precio nuevo a la vista.
- **#15 `JSON.parse` de localStorage sin try en el formulario** (`formulario/[slug]/page.js`):
  la copia local va entera en try/catch (JSON corrupto, no-array, Safari privado o cuota llena ya
  no pueden romper un envío que ya salió al backend).
- **#19 Nota «Stripe cobra en EUR»**: movida al `CurrencySelector` (aparece bajo el selector con
  cualquier moneda ≠ EUR, en los 3 pasos y en el resumen); se quitó la duplicada de OrderSummary.

Anotados, NO forzados (dudosos o necesitan backend):
- **#17 `/cart?success=true` vacía el carrito sin verificar el pago**: no se puede endurecer solo
  con `redirect_status` porque el checkout de tramos (Stripe Checkout Session) vuelve con
  `?success=true` sin `redirect_status`; verificar de verdad requiere consultar la sesión/intent
  en backend. Queda para cuando haya endpoint.
- **#2 Dos físicos distintos en el carrito = callejón sin salida**: necesita el checkout multi-item
  del backend (Fase 16/quantity), fuera del alcance web.
- El **cobro real** de los aranceles (Stripe) es de la Fase 16, como indica el encargo.

## Verificación

- `npm run build` limpio (base y final).
- `:3002` (build de producción, `next start -H 0.0.0.0`): /programa móvil 375×812 con la sección
  nueva (captura revisada: fotos reales, etiquetas, «en N meses», carrusel y flechas funcionando);
  desktop comprobado por DOM (3 tarjetas, centerMode, imágenes cargadas) — el panel del navegador
  se ocultó a mitad de sesión y las capturas de desktop salían en blanco, pero la sección está
  visible con opacidad 1 y métricas correctas. /cursos y /cocina renderizan sus testimonios.
  Carrito probado con datos inyectados (físico+US, físico+ES, 100 % digital) y limpiado después.
- Consola sin errores en /programa, /cursos, /cocina y /cart.

## Pendientes que deja esta fase

1. Confirmación de cada persona de las reseñas de /cursos y /cocina (marcadas en código).
2. Fase 16: cobrar el arancel de verdad (backend/Stripe) usando `arancelUSA` como referencia.
3. Decidir si se borran de la carpeta local los originales pesados de las fotos y los pares
   antiguos (ana/diego/jesica/manuel) que siguen sin trackear.
