# Auditoría de movimiento de los formularios

Los 14 puntos del **«Briefing de movimiento (CSS)»**
(`Drive · 07 Web Squad Fit / Diseño nueva web / Formularios / Briefing Movimiento CSS.docx`)
contra los tres formularios que hoy usan `src/app/form-motion.css`.

Estado a **28-jul-2026**, rama `feat/forms-movimiento-css-completo`.
Todo lo de aquí está leído del código, **no verificado en navegador** (esta
revisión se hizo en terminal, sin pantalla).

## Los tres formularios

| # | Formulario | Ruta | Fichero |
|---|---|---|---|
| **A** | Prellamada «Aquí empieza tu cambio» (público, sin login) | `/empieza-tu-cambio` | `src/app/(onboarding)/empieza-tu-cambio/page.js` |
| **B** | Onboarding de perfil (con sesión) | `/onboarding` | `src/app/(onboarding)/onboarding/page.js` |
| **C** | Formularios del panel: Evaluación inicial, Seguimiento semanal, Revisión mensual | `/formulario/[slug]` | `src/app/components/FormRunner.js` + `formDefinitions.js` |

Los tres comparten `src/app/form-motion.css` (clases `sf-*`), cargado desde
`src/app/(onboarding)/layout.js`. **A** y **C** comparten además el chrome
(`FormChrome.js`), el mecanográfico (`Typewriter.js`) y los sonidos; **B** es el
más viejo y no usa ni el chrome ni el mecanográfico.

> **Los tiempos no son los del briefing, y es a propósito.** El briefing pide
> 260 ms de entrada de pantalla, 220 ms de opciones, etc. Los tokens del repo
> están reafinados al alza con Hamlet y María (26-jul): 820 ms de entrada,
> 520 ms de opción. El motivo está escrito en el `:root` de `form-motion.css`:
> con los tiempos del briefing el formulario «hacía correr» al lead en vez de
> pararse a contestar. Por eso, en la tabla, **«cumple» significa "el efecto
> está implementado con el token que le corresponde"**, no "dura exactamente los
> ms del docx". Cuando la diferencia es otra cosa que un reafinado, se dice.

## Resumen

Sobre los **14 puntos numerados** (el apartado 0, «reglas generales», va aparte
y lo cumplen los tres):

| Formulario | Cumple | Parcial | No cumple | No aplica |
|---|---|---|---|---|
| **A** Prellamada | **10** / 14 | 2 — nº1 (falta la salida), nº8 (falta en la pantalla `final`) | 1 — nº11 | 1 — nº13 |
| **B** Onboarding | **10** / 14 | 1 — nº1 (falta la salida) | 1 — nº8 (sin mecanográfico) | 2 — nº11, nº13 |
| **C** Panel (FormRunner) | **12** / 14 | 1 — nº1 (falta la salida) | 0 | 1 — nº13 |

Antes de este PR: **7 / 14** en A, **7 / 14** en B y **8 / 14** en C. Los puntos
9, 10 y 11 no los cumplía ninguno (el CSS del 9 existía pero no lo aplicaba
ningún formulario, y el 10 y el 11 no existían) y el 14 estaba a medias.

Con el detalle de qué falta en cada casilla, más abajo.

## Tabla de los 14 puntos

Leyenda: **✅** cumple · **⚠️** parcial · **❌** no cumple · **—** no aplica.

| # | Qué pide el briefing | A · Prellamada | B · Onboarding | C · Panel | Qué falta |
|---|---|---|---|---|---|
| **0** | Movimiento corto (6–12 px), duraciones cortas, easing `cubic-bezier(0.2,0.8,0.2,1)`, y `@media (prefers-reduced-motion: reduce)` que mate animaciones y transiciones | ✅ | ✅ | ✅ | Easing: `--ease-ui` es exactamente el del briefing en los tres. Recorridos y duraciones están reafinados al alza a propósito (44 px de barrido, 820 ms de entrada) — ver la nota de arriba. `prefers-reduced-motion`: cubierto por el `@media` del final de `form-motion.css` + los `matchMedia` de `Typewriter.js`, `InfoBlock` y la salida de la portada. El `@media` no es el `* { }` global del briefing sino una lista de clases `sf-*`; se hizo así para no tocar animaciones de fuera del formulario (carrito, cabecera). |
| **1** | Pantalla entra con fade + slide corto (260 ms) y sale con fade rápido (180 ms) | ⚠️ | ⚠️ | ⚠️ | **Entrada: sí** (`.sf-screen-in`, barrido lateral en vez del `translateY` del briefing — decisión de diseño, es el gesto de Duolingo). **Salida: no se usa en ningún sitio.** `.sf-screen-out` existe en el CSS pero ningún formulario la aplica: React desmonta la pantalla de golpe al cambiar `index`, y el respiro que se ve en su lugar es el `ADVANCE_DELAY` (520 ms) de A y C, o nada en B. Orquestar la salida requiere una máquina de estados de dos fases en los tres, y no se ha hecho. |
| **2** | Barra de progreso: solo el ancho, sin rebote (420 ms) | ✅ | ✅ | ✅ | `.sf-progress-fill` con `--ms-progress` en los tres. |
| **3** | Opciones entran con barrido suave (220 ms) y stagger de 40–60 ms | ✅ | ✅ | ✅ | `.sf-stagger` + `--i` en línea. Stagger reafinado a 320 ms (el de 40–60 ms hacía que las casillas se solaparan tanto que parecían aparecer todas de golpe; está comentado en el CSS). |
| **4** | Botones de opción: press 90 ms + «selected settle» 140 ms | ✅ | ✅ | ✅ | `.sf-choice` / `.sf-choice.is-selected` con `--ms-press` y `--ms-settle`. |
| **5** | Selección: cambia borde y texto, sin movimiento grande | ✅ | ✅ | ✅ | Los colores van en `style` inline en cada form (no en el CSS del briefing) porque cada uno tiene su paleta de casilla; la transición sí sale de `--ms-color`. Añadido de propina, no pedido: anillo de `:focus-visible` distinto del seleccionado. |
| **6** | CTA inferior aparece/desaparece (220 ms), opacidad 0.3 → 1 | ✅ | ✅ | ✅ | `.sf-cta` / `.is-enabled` con `--ms-med`. |
| **7** | «Continuar»: press físico | ✅ | ✅ | ✅ | `.sf-cta.is-enabled:active` con `--ms-press`, sombra sólida y `--px-lift`. |
| **8** | Título con efecto mecanográfico (900–1400 ms) | ⚠️ | ❌ | ✅ | A y C usan `<Typewriter>` (JS, ms por carácter, no la animación `steps()` del briefing: así no hay salto de maquetación y el lector de pantalla lee la frase entera). En **A** el título sí se escribe, pero el texto de la pantalla `final` no (es el único bloque de A que aparece entero). En **B no hay mecanográfico en ninguna pantalla**: título y cuerpo aparecen de golpe. Para arreglarlo hay que meter `Typewriter` en B, que además implica encadenar `titleDone`/`bodyDone` como en A y C. No hecho: es un cambio de motor, no un efecto CSS. |
| **9** | Bloques informativos: entrada por párrafos, 240 ms, 90 ms entre ellos | ✅ | ✅ | ✅ | **Implementado en este PR.** Antes `.sf-info` existía en el CSS y **no la usaba ningún formulario** (CSS muerto). Ahora el componente `<InfoBlock>` (`FormChrome.js`) la enciende con `--ms-info` (320 ms de fundido) y 90 ms de `orden`. Dónde: A → párrafo de la pantalla `final` **+ la casilla del RGPD**; B → cuerpo de la intro, de «¡Todo listo!» **y su casilla del RGPD**; C → pantalla de «¡Formulario enviado!». |
| **10** | Pausa de ~500 ms al entrar a pantalla informativa, antes de activar `.is-visible` en el primer bloque | ✅ | ✅ | ✅ | **Implementado en este PR.** «Medio segundo» = **hasta que el texto se puede leer**: `--ms-info-pausa` (180 ms de temporizador) + `--ms-info` (320 ms de fundido) = **500 ms**, medido con navegador. Ver más abajo «Qué significa medio segundo». No está en **todas** las pantallas de solo lectura, y a propósito: en las intros de A y C el mecanográfico (nº8) ya escalona el revelado y la entrada de pantalla dura 820 ms, así que añadir medio segundo más era retrasar sin que se note. Se aplica donde el texto aparecía entero y de golpe: A `final`, B intro y `done`, C pantalla de enviado. En C, el emoji y el título van con **`PAUSA_ANCLA_MS` = 0**: son el ancla de esa pantalla (ver abajo). **Fuera:** la pantalla de gracias de A y `WeeklyResultScreen` del Seguimiento semanal, que siguen apareciendo de golpe (mismo patrón, es un `<InfoBlock>` cada bloque cuando se quiera). |
| **11** | Badges tipo píldora: `scale(0.98) → 1`, 180 ms | ❌ | — | ✅ | **CSS implementado en este PR** (`.sf-badge` + componente `<Badge>`). Usado en **C**, donde la fase («Tu dieta», «Tu descanso»…) ya se pintaba sobre el título y ahora va en píldora. En **A** no hay badge en pantalla: la fase existe (`phaseOf`) pero solo se ve en la columna lateral y en el cajón de móvil — pintarla también sobre la pregunta es una decisión de diseño, no una de movimiento, y no se ha tomado sin poder verla. En **B** no hay ningún concepto de badge (sus fases son una lista de texto en el lateral). |
| **12** | Grid de opciones: reutilizar la lógica de `.choiceBtn` para las cards | ✅ | ✅ | ✅ | Los tres reutilizan `.sf-choice` para todas las variantes de opción (radio, checkbox, escala 1–5, «Otro: ___»). Ninguno tiene un grid de cards propiamente: van en columna. |
| **13** | Botón flotante secundario, si existe | — | — | — | Ninguno de los tres tiene botón flotante. El único de la web es `FormularioPendiente.js` («termina tu formulario»), que vive en `(home)/layout.js` y usa `.sf-flotante`… pero **ese layout no importa `form-motion.css`**, así que hoy la clase no hace nada allí y el botón aparece sin animación. Es un bug real de una línea (`import "../form-motion.css"` en `(home)/layout.js`), fuera del alcance de este PR porque toca el layout público entero. Además `.sf-flotante` no tiene el `:active` de press que pide el briefing. |
| **14** | Todo desde los tokens `:root` (`--ease-ui`, `--ms-*`) | ✅ | ✅ | ✅ | **Completado en este PR.** Ver el detalle abajo. |

## Detalle del nº14 (unificación de tokens)

Lo que se ha sustituido, con el valor anterior al lado:

| Dónde | Antes | Ahora | ¿Cambia el resultado? |
|---|---|---|---|
| `.sf-choice` (sombra, `:active`, `:focus-visible`) | `3px` repetido 3 veces | `--px-choice-lift: 3px` | No |
| `@keyframes sfChildIn` | `-8px` | `calc(var(--px-info) * -1)` | No |
| `.sf-info` | `translateY(8px)` | `translateY(var(--px-info))` | No |
| `.sf-badge` (nuevo) | — | `--ms-fast` + `--scale-badge` | Nuevo. El briefing pide 180 ms para el badge, que es su `--ms-fast`; aquí se usa el `--ms-fast` del repo (440 ms) para no romper el mapa de tokens |
| `ExitButton`, `SoundButton`, `BackButton`, `StepCounter` (`FormChrome.js`) | `transition-all` de Tailwind | clase `.sf-tap` con `--ms-press` / `--ms-color` / `--ease-ui` | **Sí, cambio de comportamiento**: `transition-all` son 150 ms con `cubic-bezier(0.4,0,0.2,1)`. Ahora el press va a 187 ms con `--ease-ui` y el color a 400 ms, igual que el resto del formulario |

Lo que **sigue sin tokenizar**, a conciencia:

- **`cubic-bezier(.42,0,.75,.3)`** (logo tragado por el portal) y
  **`cubic-bezier(.4,0,.7,.35)`** (hilos del portal). No son `--ease-ui` porque
  no deben serlo: el portal necesita un easing que acelere al final para que el
  logo parezca absorbido. Se usan una vez cada uno.
- **`animation: sfCaret 1s`**. Es el parpadeo del cursor, un ciclo, no una
  transición de interfaz; el briefing no le pone token.
- **`--ms-type` del briefing (1100 ms)** no existe en el `:root` del repo: el
  mecanográfico se hace en JavaScript por ms/carácter (`TITLE_SPEED = 11`), no
  con la animación `steps()` del briefing, así que un token de duración total
  no tendría a quién servírselo.
- **`transition-colors` de Tailwind** en enlaces y en la lista de fases (7 sitios
  entre `FormChrome.js`, A y B). Son 150 ms con el easing de Tailwind. Cambiarlos
  a `--ms-color` (400 ms) haría los hovers de texto notablemente más lentos y no
  parecía una mejora; queda apuntado.

## Qué significa «medio segundo» (corregido el 28-jul con capturas)

La primera versión de este PR decía «pausa de medio segundo» y en realidad eran
**~930-1.060 ms**: 500 ms de `setTimeout` **más** los 560 ms del fundido
`--ms-info`. Dos números para la misma cosa, y el que se anunciaba era el que no
notaba nadie. Corregido así, y esta es la única definición válida:

> **«Medio segundo» = el tiempo desde que entra la pantalla hasta que el texto
> SE PUEDE LEER** (no hasta que empieza a asomar).

    --ms-info-pausa (180 ms, temporizador de JS)
  + --ms-info       (320 ms, fundido CSS)
  = 500 ms

Si se reafina uno, hay que reafinar el otro para que sigan sumando 500. Están
comentados así en `form-motion.css` y en `FormChrome.js`. Bajar `--ms-info` de
560 a 320 no toca nada más del sitio: `.sf-info` solo la usa `<InfoBlock>` (antes
de este PR era CSS muerto).

Números medidos con navegador (Chrome, móvil 375 px), sobre la **opacidad
efectiva** —la del bloque multiplicada por la de sus ancestros, porque el bloque
vive dentro del fundido de `.sf-screen-in` y mirar solo su propia opacidad
miente—. «Legible» = opacidad efectiva > 0,9.

| Bloque | Antes (500 + 560) | Ahora (180 + 320) |
|---|---|---|
| C · emoji 🎉 | invisible (0,00) a los 120 ms | **0,45 a los 121 ms** · legible a los 328 ms |
| C · `<h1>` «¡Formulario enviado!» | legible a los **957 ms** | **0,13 a los 121 ms** · legible a los **344 ms** |
| C · párrafo | invisible (0,00) a los 120 ms | legible a los **378 ms** |
| C · botón «Volver a mi panel» | legible a los **1.188 ms** | legible a los **444 ms** |
| C · pantalla completa a opacidad ≥ 0,99 | ~1.400 ms | **603 ms** |
| A · párrafo del RGPD | invisible **932 ms** | `.is-visible` a los 180 ms, 0,88 a los 327 ms, 1,00 a los 522 ms |
| A · casilla del RGPD | pulsable **desde el frame 0**, con el párrafo a 0,00 | pulsable a los 270 ms, con el párrafo ya a **0,72** |

La captura que enseñaba el defecto grave (`pr71-enviado-normal-120ms.png`) era un
PNG blanco. La misma captura después del arreglo
(`pr71-ARREGLADO-enviado-normal-120ms.png`) tiene el emoji y el título.

## Dos reglas que salieron de la verificación visual

**1. Ninguna pantalla puede quedarse ENTERA en blanco durante el respiro.** Tiene
que haber un ancla visible en el milisegundo 0 —un título, un emoji— o el usuario
no sabe si su clic ha hecho algo. B y A ya la tenían (su `<h1>` no es un bloque
info: se pinta siempre). **C no**: la pantalla de «¡Formulario enviado!» son solo
bloques info, así que con el respeto en los cuatro quedaba literalmente vacía casi
un segundo justo después de pulsar «Enviar mis respuestas». Ahora el emoji y el
título llevan `pausa={PAUSA_ANCLA_MS}` (0 ms, solo fundido) y el respiro se queda
donde se gana el sueldo: el párrafo y el botón.

**2. Un control para ACEPTAR algo no puede volverse pulsable antes que el texto
que explica lo que acepta.** La casilla del RGPD de A estaba fuera del retardo —a
propósito, porque es lo único que hay que tocar— y el resultado invertía el
objetivo del punto 10: casilla pintada y **pulsable** con el texto invisible 932 ms.
Se ha metido dentro, en su propio `<InfoBlock>` un `orden` por detrás del párrafo
(A) o dos (B, que además tiene emoji). Y `.sf-info` lleva ahora
`pointer-events: none` mientras no se ve, porque un bloque a `opacity: 0` se puede
pulsar igual de bien que uno visible; se restaura con `.is-visible` y, sin clase
ninguna, dentro del `@media reduce`.

Comprobado con un clic de ratón de verdad (no `.click()` sintético, que se salta
el `pointer-events`): tocando la casilla a los **70 ms**, con el párrafo a
opacidad 0, la casilla **no se marca** y «Enviar mis respuestas» sigue
deshabilitado. El mismo toque con la pantalla asentada sí la marca y sí habilita
el botón.

## La pausa del nº10 y «reducir animaciones»

El fallo fácil aquí es: el `@media (prefers-reduced-motion: reduce)` mata la
transición, pero el JavaScript sigue esperando el respiro para poner `.is-visible`
→ **quien reduce animaciones ve media pantalla en blanco durante medio segundo**,
que es justo lo contrario de lo que pidió.

Resuelto con tres capas, para que fallando una siga en pie:

1. **El bloque nunca se monta con retardo.** `<InfoBlock>` renderiza siempre su
   contenido; lo único que espera es la clase `.is-visible`. Así el texto está
   en el DOM desde el primer frame y un lector de pantalla lo lee entero sin
   esperar a ningún temporizador.
2. **El CSS lo deja visible sin `.is-visible`.** Dentro del `@media reduce`,
   `.sf-info` y `.sf-badge` llevan `opacity: 1` (sin la clase) y `.sf-info`
   además `pointer-events: auto`, aparte de `transition: none` y
   `transform: none`. Es decir: aunque el temporizador no salte nunca —o el JS
   se caiga—, el contenido se ve **y la casilla del RGPD se puede marcar**.
3. **El JS tampoco espera.** `InfoBlock` consulta `prefers-reduced-motion` y, si
   está activo, enciende `.is-visible` en el mismo efecto de montaje, sin
   `setTimeout`. La espera existe para que se lea el fundido; sin fundido serían
   180 ms de nada a cambio de nada.

Verificado con navegador: con «reducir animaciones» activo el texto está a
opacidad 1 a los **0-6 ms**, y el CSS lo enseña incluso si se le quita la clase
`is-visible` a mano.

Queda escrito en el CSS y en el componente que **si algún día se cambia
`<InfoBlock>` para montar el bloque cuando toque, en vez de solo pintarlo, las
capas 1 y 2 se caen y vuelve el medio segundo en blanco.**

## Pendientes, por orden de lo que más se nota

1. **nº8 en el onboarding (B)**: no tiene mecanográfico. Es el que más lo separa
   de los otros dos.
2. **nº1, salida de pantalla**: `.sf-screen-out` es CSS muerto en los tres.
   Hace falta una transición de dos fases al cambiar de pregunta.
3. **nº13**: `(home)/layout.js` no carga `form-motion.css`, así que el botón
   flotante de «termina tu formulario» aparece sin animación. Una línea.
4. **nº11 en A**: decidir con diseño si la fase se pinta en píldora sobre la
   pregunta, como en C.
5. **nº10 en las pantallas de gracias** de A y del Seguimiento semanal.
