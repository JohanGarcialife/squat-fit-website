'use client'

import { useEffect } from 'react'

/**
 * Recarga la página cuando el navegador restaura una pestaña VIEJA.
 *
 * El caso real que arregla: sales de la web (pagar en Stripe, abrir un enlace
 * externo…), le das a «atrás» y el navegador te devuelve la página desde su
 * caché de atrás/adelante (bfcache) exactamente como la dejaste — sin pedir
 * nada al servidor. Si mientras tanto se ha desplegado, sigues viendo la web
 * anterior, y no se arregla navegando por dentro: hay que recargar a mano
 * (ctrl/⇧+F5) o salir y volver a entrar. Con varios despliegues al día, eso
 * pasa a diario.
 *
 * Cómo se detecta: `pageshow` con `event.persisted` es exactamente «esta
 * página viene de la bfcache». Ahí, y SOLO ahí, se pregunta a /api/version qué
 * versión está publicada y se compara con la que lleva incrustada este bundle.
 * Si no coinciden, la pestaña se quedó atrás y se recarga.
 *
 * Por qué solo en ese momento y no cada dos por tres: recargar por sorpresa
 * mientras alguien rellena un formulario sería peor que el problema. Al volver
 * de un pago o de un enlace externo no hay nada a medias que perder.
 *
 * En local no hace nada (`NEXT_PUBLIC_BUILD_ID` vale 'dev'), y si la petición
 * falla tampoco: sin respuesta clara, no se toca la página.
 */
export default function RecargaSiHayDespliegue() {
  useEffect(() => {
    const mia = process.env.NEXT_PUBLIC_BUILD_ID
    if (!mia || mia === 'dev') return undefined

    let recargando = false
    const alRestaurar = async (evento) => {
      if (!evento.persisted || recargando) return
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { id } = await res.json()
        if (id && id !== 'dev' && id !== mia) {
          recargando = true
          window.location.reload()
        }
      } catch {
        /* sin red o sin respuesta: mejor dejar la página como está */
      }
    }

    window.addEventListener('pageshow', alRestaurar)
    return () => window.removeEventListener('pageshow', alRestaurar)
  }, [])

  return null
}
