# Preview de widgets para seQura

Rama de **solo demostración**. Existe para que el equipo de integración de seQura
pueda revisar los componentes promocionales funcionando, sin encenderlos en
squadfit.es.

- El simulador se activa con `NEXT_PUBLIC_SEQURA_READY`, definida en Vercel
  **únicamente para el entorno `preview`**. Producción no la tiene.
- Entorno seQura: **sandbox** (`sandbox.sequracdn.com`), comercio `squatfit_web`.
- Dónde se ve: fichas de curso en `/cursos` (tramos anual y de por vida) y en el
  carrito, bajo el total.
- Dónde NO se ve, a propósito: tramos de suscripción (mensual y trimestral),
  divisas distintas del euro, e importes por debajo de 50 €.

No mergear a `main`: no aporta código, solo este documento.
