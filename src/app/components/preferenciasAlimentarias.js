'use client'

// Preferencias alimenticias del cliente (vegano, sin lactosa, sin gluten, sin
// huevo). Sirven para que, dentro de una receta, la opción que le encaja salga
// como ingrediente PRINCIPAL y el resto baje al desplegable de sustituciones.
//
// Viven en localStorage a propósito, no en el backend: hoy no hay ni columna
// ni endpoint donde guardarlas (el perfil del usuario no tiene nada de dieta,
// comprobado contra /user/info), y montar la migración solo para esto retrasa
// lo que los compradores ya están esperando. El día que exista el campo, este
// módulo es el único sitio que hay que cambiar — las pantallas solo usan el
// hook. Mismo criterio y mismo blindaje que cookieConsent.js: si no hay
// localStorage (modo privado antiguo), la elección no persiste pero nada se
// rompe.

import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'sqf_pref_alim'

export const PREFERENCIAS = [
  { id: 'vegano', label: 'Vegano', hint: 'Prioriza las opciones vegetales del libro' },
  { id: 'sin_lactosa', label: 'Sin lactosa', hint: 'Bebidas y quesos vegetales primero' },
  { id: 'sin_gluten', label: 'Sin gluten', hint: 'Prioriza las versiones aptas para celíacos' },
  { id: 'sin_huevo', label: 'Sin huevo', hint: 'Prioriza los sustitutos del huevo' },
]

const VALIDAS = new Set(PREFERENCIAS.map((p) => p.id))

function leer() {
  try {
    const bruto = localStorage.getItem(CLAVE)
    if (!bruto) return []
    const datos = JSON.parse(bruto)
    return Array.isArray(datos) ? datos.filter((d) => VALIDAS.has(d)) : []
  } catch {
    return []
  }
}

export function usePreferenciasAlimentarias() {
  // `null` hasta leer el almacenamiento: en el primer render del servidor no
  // hay localStorage y pintar [] provocaría un salto visual al montar.
  const [preferencias, setPreferencias] = useState(null)

  useEffect(() => {
    setPreferencias(leer())
  }, [])

  const alternar = useCallback((id) => {
    if (!VALIDAS.has(id)) return
    setPreferencias((previas) => {
      const base = previas || []
      const siguiente = base.includes(id) ? base.filter((p) => p !== id) : [...base, id]
      try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente))
      } catch {
        /* sin storage: vale para esta sesión y ya */
      }
      return siguiente
    })
  }, [])

  const limpiar = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      /* sin storage */
    }
    setPreferencias([])
  }, [])

  return { preferencias: preferencias || [], listas: preferencias !== null, alternar, limpiar }
}
