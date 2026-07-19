# Informe Fase 1 — sesión nocturna (19 jul 2026)

Rama: `mejoras-landing-lote-2` · Todo verificado en el build de revisión (`:3002`, `NEXT_DIST=.next-rev`). **No se ha tocado `main`.**

## Qué se hizo (las 10 tareas, completadas)

### 1. Menú móvil: hamburguesa al azul de marca
- `BurgerMenu.js`: el icono pasa de `#3932C0` a `#363C98` (naranja al abrir, como estaba).
- Verificado en el HTML servido de la home.
- Nota: el resto del sitio sigue usando `#3932C0` en muchos sitios (sidebar del panel, títulos…). Solo se pidió la hamburguesa; si queréis unificar todo a `#363C98` es un cambio masivo aparte.

### 2. Portadas 6.4 en /public (mapeo validado por Hamlet)
- Sustituidos: `Libro1.png` ← «Libro 1 espiral mock up», `Libro2.png` ← «Libro 2 espiral mock up», `LibrosFisicos.png` ← «Libro 1 y 2 impreso», `mockup_cocina.png` ← «Módulos/Libro cocina 1  digital» (con su doble espacio), `cocinaHero.png` ← «Cocina-Landing», `Mockuptelefono1.png` ← «Libro 1 biblioteca».
- Eliminados `LibroCocina.png` e `image32.png` (grep confirmó cero usos). `Group32.png` intacto.
- Todos los PNG >1MB optimizados con sharp (resize ≤1200px + paleta): ahora pesan 200–420 KB.
- Verificado visualmente en `/cocina` (hero y mockups nuevos renderizando).

### 3. Top ventas del Inicio del panel: foto cuadrada
- `TopVentas.js`: la imagen de las tarjetas pasa de franja horizontal (`h-48`) a **cuadrada** (`aspect-square`), en ambas variantes (top ventas y «Continúa donde estabas»).
- Además: helper `coverFor()` que mapea el título del curso a las **portadas nuevas** locales (cocina→`mockup_cocina`, fuerte/definid@→`mockup_fuerte_definido`, libro→`Libro1/2`…); si no hay match usa la imagen del backend (hosts permitidos) y como último recurso `Libro1.png` (antes `Group32.png`). Los cursos del backend hoy son de prueba; cuando carguéis los reales con esos títulos, saldrán las portadas buenas solas.
- Verificado con sesión forjada en `/panel-control` (captura ok).

### 4. Banner de cookies (web + dashboard)
- Nuevo `CookieBanner.js`: discreto abajo, blanco con acentos índigo/naranja, redondeado. Botones **Aceptar / Solo esenciales / Preferencias** y enlace a `/politicas?tab=cookies`.
- El texto refleja la realidad: sin analítica ni publicidad; solo almacenamiento propio (sesión, carrito, preferencias) y cookies de Stripe para pagos.
- «Preferencias» despliega las dos categorías (esenciales y Stripe, ambas siempre activas) y aclara que no hay opcionales que desactivar.
- Persistencia en `localStorage` (`sqf-cookie-consent` = `{choice, date}`); no vuelve a salir.
- Montado en los 4 layouts: `(home)`, `(panel-control)`, `(auth)`, `(cart)`. Decisión: NO en `(onboarding)` (flujos inmersivos: onboarding, prellamada y formularios del panel; ahí molestaría y no añade nada).
- Bonus necesario: `/politicas` ahora acepta `?tab=<id>` y `#<id>` para abrir un apartado directo (antes siempre abría el primero).

### 5. RGPD: checkbox en TODOS los forms
- Nuevo `GdprCheckbox.js` reutilizable («He leído y acepto la Política de Privacidad», enlace a `/politicas?tab=privacidad` en pestaña nueva; variante `light` para fondos oscuros).
- Integrado con **enviar deshabilitado sin el check** en: `/contacto`, Empleo (Conócenos→Únete al equipo), `/register` (variante light), `/onboarding` (en el último paso, bloquea «Ir a mi panel»), `/panel-contacto` y `/profile-panel` (en la barra «Guardar cambios»).
- Verificado en navegador: `/register` (botón gris hasta marcar), `/contacto` (disabled true→false al marcar) y Empleo.

### 6. Carrito 3.3 (scroll) y 3.4 (deshacer)
- **3.4**: en la página `/cart` el botón «−» ahora usa `decrementQuantity` (elimina al llegar a 0, deshacible) y hay aviso «Deshacer» como en el pop-up; también en la pantalla «Tu carrito está vacío» (caso: se eliminó el único producto). Verificado en navegador: eliminar con −, deshacer y recuperar.
- **3.3**: nuevo `CartScrollRestore.js`. Al ir a `/cart` (pop-up «Finalizar compra» o enlace del footer) se guarda `{ruta, scrollY}`; `/cart` marca su salida con `pagehide` (entre grupos de layout la navegación es de página completa, sin cleanup de React); al volver a la misma ruta se restaura la posición con reintentos (las imágenes tardan en dar altura).
- Verificación: el ciclo completo guardar→salir→volver→consumo de claves está comprobado en navegador; **la posición visual final no se pudo comprobar aquí** porque el navegador embebido de esta sesión no permite scroll programático (bug del panel, no de la web). Pendiente un vistazo de 10 segundos en el iPhone: /cocina, bajar, ir al carrito, volver atrás.

### 7. Movimiento CSS del briefing → onboarding
- Nuevo `src/app/form-motion.css` con clases reutilizables y tokens del briefing: `.sf-screen-in/out` (260/180 ms), `.sf-progress-fill` (420 ms), `.sf-stagger` (40–60 ms por ítem vía `--i`), `.sf-choice` (press 90 ms + `.is-selected`), `.sf-cta` (atenuado→habilitado + press), `.sf-info`, easing `cubic-bezier(0.2,0.8,0.2,1)` y bloque completo `@media (prefers-reduced-motion: reduce)`.
- Aplicado al onboarding (pantallas, barra, opciones de sexo y selects, CTA) sustituyendo la animación anterior. Verificado por computed styles (0.26s/0.42s/0.22s activos).
- Se importa desde el layout `(onboarding)`, con lo que prellamada y formularios del panel ya lo heredan.

### 8. Form de PRELLAMADA «Aquí empieza tu cambio» (13.11)
- Nueva página **pública sin login**: **`/empieza-tu-cambio`** (grupo `(onboarding)`, pantalla completa, motor visual Duolingo + movimiento del punto 7).
- Las 16 preguntas transcritas 1:1 del JSON de Fluent Forms, con **claves estables = los `name` del JSON** (`first_name`, `edad`, `region_vives`, `objetivo_principal`, `impide_lograr[]`, `intentos`, `prioridad_para_ti`, `empuja_a_cambiar`, `tiempo_y_esfuerzo`, `inversion`, `obstaculo_importante`, `coach_squat_fit`, `peso_altura`, `phone` (react-phone-input-2), `instagram` opcional) + `timestamp` y `origen`. RGPD en el último paso.
- Guardado: el módulo de forms del backend (`/api/v1/advice/create-answer-form`) **exige sesión**, y este form es público → el POST queda preparado tras la constante `SUBMIT_ENDPOINT` (hoy `null`) y la solicitud se guarda en `localStorage` (`sqf-prellamada-solicitudes`). En cuanto haya endpoint público, es poner la URL.
- Pantalla de gracias con botón «Reservar mi llamada» → constante `BOOKING_URL` (hoy `/contacto`).
- **CTAs de /programa**: `ProgramPricing.js` deja de caer a `/contacto`; ahora `BOOKING_URL || '/empieza-tu-cambio'` (cuando peguéis el Calendly, manda el Calendly).
- Verificado: recorrido completo de las 17 pantallas por navegador, validaciones por tipo, envío y solicitud guardada con todas las claves.

### 9. Forms del dashboard 14.1–14.3
- Nuevo motor genérico **`FormRunner.js`** (mismo look del onboarding: fases en el lateral, barra, stagger, CTA) con los tipos que piden los docx: opción única (con «Otro: ___»), escala 1–5 (guarda valor numérico + etiqueta), casillas, texto corto/párrafo, numérica con unidad y rango, listas libres con «no consumo nada», recuerdo de comidas, consentimiento, y **condicionales** (`showIf`).
- **`formDefinitions.js`** con los tres formularios transcritos de los docx:
  - **Evaluación inicial** (18 pasos + consentimiento, ~85 pantallas base): todos los pasos del docx incluidos los condicionales «si responde Sí → dime cuál», el bloque **Para mujeres** (se salta si `gender === 'male'`, leído del perfil), analíticas condicionales, ramas casa/gimnasio y el recuerdo de 24 h.
  - **Seguimiento semanal**: las 10 preguntas con **claves estables de `habit_engine_config.json`** (`weekly_training_adherence`, `weekly_menu_adherence`, `weekly_hunger`, `weekly_hydration_urine_color`, `weekly_sleep_hours`, `weekly_sleep_quality`, `weekly_energy`, `weekly_stress`, `weekly_steps_level`, `weekly_weight_kg` opcional). Al enviar se calculan y guardan los **scores del motor** (adherencia ×0.4 + recuperación ×0.4 + estrés ×0.2) y el `week_id` ISO (ej. `2026-W29`) — listo para el motor de Alertas.
  - **Revisión mensual**: medidas, entreno (con los bloques condicionales de motivos/ayudas si el cumplimiento es 1–2), dieta y adherencia.
- Rutas: **`/formulario/evaluacion-inicial`**, **`/formulario/seguimiento-semanal`**, **`/formulario/revision-mensual`** (requieren sesión; `AccessNotice` si no).
- Acceso desde el dashboard: sección **«Mis formularios»** en `/panel-planes` (Planes) con las 3 tarjetas.
- Guardado igual que el punto 8: POST preparado a `create-answer-form` tras el mapa `BACKEND_FORM_IDS` (hoy vacío; existe el tipo «Revisión Mensual» en el back pero hace falta el `form_id` del formulario creado en back office) + copia en `localStorage` (`sqf-form-<slug>`).
- Verificado en navegador: semanal completo (scores y week_id correctos), evaluación inicial hasta «Tus hábitos» con follow-ups apareciendo, y mensual con los condicionales expandiendo el total (22→26 pantallas al elegir cumplimiento bajo). La validación de rangos numéricos también verificada (rechazó 100 cm de brazo).

### 10. Premium 5 recetas/semana + repaso de capturas
- No existía ningún copy «4 recetas/mes» literal; la cadencia se menciona ahora explícitamente («**5 recetas nuevas cada semana**») en los 4 sitios donde se describe el beneficio: hero de `/cocina`, FAQ «¿Cómo accedo a la versión digital?», tarjeta «Digital de por vida» (Shop) y pantalla sin suscripción de `/panel-cocina`. Verificado (3 apariciones en `/cocina` + panel).
- **Capturas del Desktop**:
  - *20.13.45*: onboarding con «Sedentario/Ligero…» en masculino y sin aclaraciones → es de la versión desplegada; en esta rama ya está corregido (femenino + aclaración). Se arregla solo al desplegar.
  - *21.48.37*: `/activate` en texto plano sin marca → **causa encontrada y arreglada**: la página colgaba fuera de todos los grupos de layout y se servía sin `globals.css`. Nuevo `src/app/activate/layout.js` mínimo con estilos y fuente; ahora la pantalla de activación sale con la tarjeta de marca (verificado). El texto «en 1 segundos» de la captura ya no existe en el código actual.

## Decisiones tomadas (autónomas)
1. **Slug del form de prellamada**: `/empieza-tu-cambio` (título del JSON «Aquí empieza tu cambio»). Fácil de cambiar si preferís otro.
2. **Cookie banner fuera de los flujos inmersivos** (onboarding/forms): ahí no hay navegación y estorbaría; la web y el panel lo muestran siempre.
3. **Top ventas**: mapeo por título → portada local, con respaldo `Libro1.png` en vez de `Group32.png` (arte viejo).
4. **Guardado de forms**: sin endpoint público (prellamada) o sin `form_id` (panel), todo queda en `localStorage` con claves estables y el POST preparado a un cambio de constante. Nada se pierde ni se inventa un endpoint.
5. **Scores del semanal calculados en el cliente** y guardados junto a las respuestas: el motor de Alertas puede consumirlos tal cual o recalcularlos en backend.
6. `pkill -f "PORT=3002"` **no mata** el server real (la env no está en su línea de comandos); ahora se mata por puerto (`kill $(lsof -ti:3002)`). Anotado para futuras sesiones.

## Pendientes / para revisar por la mañana
- **Ojo (10 s en iPhone)**: scroll del carrito (3.3) — bajar en /cocina, ir al carrito, volver atrás y comprobar que vuelve al mismo punto. El mecanismo está verificado; el navegador embebido de esta sesión no permitía comprobar el scroll visual final.
- **`BACKEND_FORM_IDS`** en `src/app/(onboarding)/formulario/[slug]/page.js`: rellenar cuando existan los formularios en el back office (endpoint `create-answer-form` listo).
- **`SUBMIT_ENDPOINT`** de la prellamada: falta un endpoint **público** de forms en el backend (los de `/advice` exigen sesión). Mientras, las solicitudes quedan en el localStorage del visitante — suficiente para maquetar, no para producción del funnel.
- **`BOOKING_URL`**: en la pantalla de gracias de la prellamada apunta a `/contacto`; cambiar por el Calendly cuando exista (y el de `ProgramPricing.js`).
- Los cursos del panel siguen siendo de prueba en el backend; las portadas nuevas del Top ventas lucirán del todo con los productos reales.
- El masculino del onboarding de la captura se corrige al desplegar esta rama (ya estaba arreglado aquí).
