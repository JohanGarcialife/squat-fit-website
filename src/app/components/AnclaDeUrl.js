'use client'

import { useEffect } from 'react'

/**
 * SALTO A #ANCLA QUE AGUANTA LA CARGA DE LA PÁGINA.
 *
 * El navegador salta al `#ancla` UNA vez y solo si el elemento ya existe. En
 * esta web casi nunca existe todavía: las secciones que interesan —la tienda
 * del recetario, la tarjeta de precios de los cursos— se pintan cuando
 * responde /api/v1/catalog, o sea bastante después de la primera pantalla.
 * Medido el 7-ago en /cocina#precios: el ancla aparecía a 11.054 px y la
 * página se quedaba clavada arriba, sin moverse.
 *
 * Y aunque exista, las fotos de más arriba siguen cargando y empujan el
 * contenido hacia abajo, con lo que un salto temprano se queda corto.
 *
 * Así que esto espera a que el ancla aparezca (mirando cada poco, hasta 6 s) y
 * luego insiste un par de segundos mientras la página se asienta. Si el
 * visitante toca la rueda, la pantalla o el teclado, se para en seco: mandar es
 * él, no nosotros.
 *
 * Sin almohadilla en la URL no hace absolutamente nada.
 */
const ESPERA_MAX_MS = 6000
const INSISTIR_MS = 2000
const CADA_MS = 150

export default function AnclaDeUrl() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace('#', ''))
    if (!id) return

    let vivo = true
    let encontradoEn = null
    const desde = performance.now()
    const parar = () => { vivo = false }

    const tic = setInterval(() => {
      if (!vivo) return clearInterval(tic)
      const ahora = performance.now()
      const el = document.getElementById(id)

      if (el) {
        if (encontradoEn === null) encontradoEn = ahora
        el.scrollIntoView({ block: 'start' })
        // Ya colocado y la página quieta: se acabó, que no queremos pelearnos
        // con el visitante cada vez que algo cambie de tamaño más tarde.
        if (ahora - encontradoEn > INSISTIR_MS) clearInterval(tic)
        return
      }
      // El ancla no llega: puede que esa sección no exista en esta página.
      if (ahora - desde > ESPERA_MAX_MS) clearInterval(tic)
    }, CADA_MS)

    // `passive` en los de scroll: aquí no se cancela nada, solo se escucha.
    window.addEventListener('wheel', parar, { passive: true })
    window.addEventListener('touchstart', parar, { passive: true })
    window.addEventListener('keydown', parar)

    return () => {
      vivo = false
      clearInterval(tic)
      window.removeEventListener('wheel', parar)
      window.removeEventListener('touchstart', parar)
      window.removeEventListener('keydown', parar)
    }
  }, [])

  return null
}
