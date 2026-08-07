'use client'

import { useEffect, useRef } from 'react'

/**
 * PESTAÑAS QUE SE PUEDEN ENLAZAR.
 *
 * Un submenú de <BrandTabs> es estado de React: cambia lo que se ve pero no la
 * dirección, así que no hay forma de mandar a nadie a un apartado concreto. Esto
 * le pone almohadilla: /conocenos#contacto, /politicas#privacidad,
 * /mi-programa#recursos.
 *
 * LA ALMOHADILLA LLEVA EL NOMBRE DE LA PESTAÑA, no su id interno. Lo que se ve
 * en pantalla es lo único que el visitante puede adivinar o dictar por teléfono.
 * De ahí que la pestaña «María» sea #maria y no #sobre-maria, que era como
 * estaba y no valía.
 *
 * Al leer se acepta de todo —el id interno, el nombre entero, el nombre con su
 * relleno— para que ningún enlace ya repartido se caiga. Al escribir sale
 * siempre una sola forma, la corta.
 *
 * La primera pestaña no pone almohadilla: es la que sale por defecto y la URL
 * se queda limpia.
 */

// Palabras de relleno al principio del nombre. «Sobre María» es María, y
// «Política de Privacidad» es privacidad: nadie escribe el prefijo.
const RELLENO = /^(sobre|politica-de|politicas-de)-/

function normalizar(texto) {
  return String(texto ?? '')
    // Las cuentas entre paréntesis cambian al cargar los datos («En progreso
    // (0)» pasa a «(3)»), así que fuera: la almohadilla tiene que ser estable.
    .replace(/\([^)]*\)/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Nombre de pestaña -> almohadilla corta. «Sobre María» -> `maria`. */
export function slugPestana(etiqueta) {
  const entero = normalizar(etiqueta)
  return entero.replace(RELLENO, '') || entero
}

/** Qué pestaña pide la URL, o null si no pide ninguna que exista. */
export function pestanaDeUrl(tabs) {
  const params = new URLSearchParams(window.location.search)
  const crudo =
    window.location.hash.replace('#', '') ||
    // ?tab= lo usa /politicas y ?seccion= la pantalla legal del panel. Se
    // mantienen: hay enlaces vivos con esa forma.
    params.get('tab') ||
    params.get('seccion') ||
    ''
  if (!crudo) return null

  let pedido
  try {
    pedido = decodeURIComponent(crudo).toLowerCase()
  } catch {
    pedido = crudo.toLowerCase() // %-mal escrito: se usa tal cual
  }

  // La misma poda se le aplica a lo que pide la URL, y por eso #sobre-maria
  // sigue abriendo la pestaña «María» aunque su id sea ya `maria`.
  const podado = slugPestana(pedido)

  const encontrada =
    tabs.find((t) => String(t.id).toLowerCase() === pedido) ||
    tabs.find((t) => slugPestana(t.label) === pedido) ||
    tabs.find((t) => normalizar(t.label) === pedido) ||
    tabs.find((t) => String(t.id).toLowerCase() === podado) ||
    tabs.find((t) => slugPestana(t.label) === podado)

  return encontrada ? encontrada.id : null
}

/**
 * Engancha un submenú a la URL. Devuelve la función que hay que pasarle a
 * <BrandTabs onChange={…}> en lugar del `setEstado` pelado.
 *
 *   const cambiarPestana = usePestanasEnUrl(TABS, setActiveTab)
 *   <BrandTabs tabs={TABS} active={activeTab} onChange={cambiarPestana} />
 */
export default function usePestanasEnUrl(tabs, setActiva) {
  // Por referencia: `tabs` suele ser un array escrito en el propio render, o
  // sea nuevo en cada vuelta. Como dependencia del efecto haría que se
  // desenganchara y volviera a enganchar el listener sin parar.
  const ref = useRef({ tabs, setActiva })
  ref.current = { tabs, setActiva }

  useEffect(() => {
    const leer = () => {
      const id = pestanaDeUrl(ref.current.tabs)
      if (id) ref.current.setActiva(id)
    }
    leer()
    // Y al vuelo: si ya estás en la página y pulsas un enlace a #contacto, no
    // hay recarga y el efecto no se vuelve a ejecutar solo.
    window.addEventListener('hashchange', leer)
    return () => window.removeEventListener('hashchange', leer)
  }, [])

  return (id) => {
    setActiva(id)
    const { tabs: actuales } = ref.current
    const esLaPrimera = actuales[0] && actuales[0].id === id
    const pestana = actuales.find((t) => t.id === id)
    const hash = esLaPrimera ? '' : `#${slugPestana(pestana?.label || id)}`
    // Se conserva la query (/panel-cursos lleva ?id=…). replaceState y no
    // pushState: así «atrás» sale de la página en vez de recorrer pestañas.
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search + hash
    )
  }
}
