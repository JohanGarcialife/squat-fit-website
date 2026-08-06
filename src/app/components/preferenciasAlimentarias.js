'use client'

// Preferencias alimenticias del cliente: sus DIETAS y sus ALÉRGENOS.
//
// El vocabulario NO es inventado: es exactamente el de la base de datos
// alimentaria de Squad Fit («Guia JSON para devs.md», v3.7) — 9 dietas
// booleanas «apto para» y los 14 alérgenos de la UE. Se guardan con esas
// mismas claves y con la forma del «perfil de cliente sugerido» que describe
// la guía (`{ dietas: [...], alergenos: [...] }`), para que el día que exista
// el endpoint sea un volcado y no una traducción:
//
//   dietas    ⊆ vegana, vegetariana, sin_gluten, sin_lactosa, baja_fodmap,
//               keto, alta_proteina, halal, kosher
//   alergenos ⊆ gluten, crustaceos, huevo, pescado, cacahuete, soja, leche,
//               frutos_cascara, apio, mostaza, sesamo, sulfitos, altramuces,
//               moluscos
//
// Semántica: `dietas` es «apto para» y `alergenos` es «CONTIENE» — el cliente
// declara los que quiere EVITAR, y por eso en pantalla se leen como «Sin
// huevo», «Sin leche»…
//
// Para qué sirven hoy: dentro de una receta, la sustitución que encaja con el
// cliente sube a ingrediente principal (ver recetarioIngredientes.js). Las
// dietas que el libro no sabe sustituir —halal, kosher, baja en FODMAP…— se
// guardan igual: son perfil del cliente y las va a necesitar el generador de
// menús, aunque hoy no muevan ningún ingrediente.
//
// Viven en localStorage a propósito: el perfil del usuario no tiene hoy
// ningún campo de dieta (comprobado contra /user/info) y montar la migración
// solo para esto retrasa lo que los compradores ya están esperando. Este
// módulo es el único sitio que hay que cambiar cuando exista. Mismo blindaje
// que cookieConsent.js: sin localStorage la elección no persiste, pero nada
// se rompe.

import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'sqf_pref_alim'

export const DIETAS = [
  { id: 'vegana', label: 'Vegana' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'sin_gluten', label: 'Sin gluten' },
  { id: 'sin_lactosa', label: 'Sin lactosa' },
  { id: 'baja_fodmap', label: 'Baja en FODMAP' },
  { id: 'keto', label: 'Keto' },
  { id: 'alta_proteina', label: 'Alta en proteína' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

// Los 14 de la UE. Se leen en negativo porque el cliente marca lo que evita.
export const ALERGENOS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'leche', label: 'Leche' },
  { id: 'huevo', label: 'Huevo' },
  { id: 'frutos_cascara', label: 'Frutos de cáscara' },
  { id: 'cacahuete', label: 'Cacahuete' },
  { id: 'soja', label: 'Soja' },
  { id: 'pescado', label: 'Pescado' },
  { id: 'crustaceos', label: 'Crustáceos' },
  { id: 'moluscos', label: 'Moluscos' },
  { id: 'apio', label: 'Apio' },
  { id: 'mostaza', label: 'Mostaza' },
  { id: 'sesamo', label: 'Sésamo' },
  { id: 'sulfitos', label: 'Sulfitos' },
  { id: 'altramuces', label: 'Altramuces' },
]

const DIETAS_VALIDAS = new Set(DIETAS.map((d) => d.id))
const ALERGENOS_VALIDOS = new Set(ALERGENOS.map((a) => a.id))

const VACIO = { dietas: [], alergenos: [], elegido: false }

function leer() {
  try {
    const bruto = localStorage.getItem(CLAVE)
    if (!bruto) return VACIO
    const datos = JSON.parse(bruto)
    // Formato viejo (fase B inicial): un array plano de cuatro claves con dos
    // que no son las de la base alimentaria —`vegano` (allí es `vegana`) y
    // `sin_huevo` (allí es el alérgeno `huevo`)—. Se convierten en vez de
    // tirarse, para no vaciarle las preferencias a quien ya las había marcado.
    if (Array.isArray(datos)) {
      const dietas = datos
        .map((d) => (d === 'vegano' ? 'vegana' : d))
        .filter((d) => DIETAS_VALIDAS.has(d))
      return {
        dietas,
        alergenos: datos.includes('sin_huevo') ? ['huevo'] : [],
        elegido: datos.length > 0,
      }
    }
    if (!datos || typeof datos !== 'object') return VACIO
    return {
      dietas: (datos.dietas || []).filter((d) => DIETAS_VALIDAS.has(d)),
      alergenos: (datos.alergenos || []).filter((a) => ALERGENOS_VALIDOS.has(a)),
      elegido: datos.elegido === true,
    }
  } catch {
    return VACIO
  }
}

function guardar(valor) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(valor))
  } catch {
    /* sin storage: vale para esta sesión y ya */
  }
}

export function usePreferenciasAlimentarias() {
  // `null` hasta leer el almacenamiento: en el primer render del servidor no
  // hay localStorage y pintar el estado vacío provocaría un salto visual.
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    setPerfil(leer())
    // Dos pestañas abiertas, o la bienvenida y la barra de filtros a la vez:
    // el evento `storage` solo salta entre pestañas, así que se añade uno
    // propio para mantener sincronizados los componentes de esta misma.
    const refrescar = () => setPerfil(leer())
    window.addEventListener('storage', refrescar)
    window.addEventListener('sqf-preferencias', refrescar)
    return () => {
      window.removeEventListener('storage', refrescar)
      window.removeEventListener('sqf-preferencias', refrescar)
    }
  }, [])

  const escribir = useCallback((siguiente) => {
    guardar(siguiente)
    setPerfil(siguiente)
    try {
      window.dispatchEvent(new Event('sqf-preferencias'))
    } catch {
      /* entorno sin window */
    }
  }, [])

  const alternar = useCallback(
    (tipo, id) => {
      const valido = tipo === 'dietas' ? DIETAS_VALIDAS.has(id) : ALERGENOS_VALIDOS.has(id)
      if (!valido) return
      const base = perfil || VACIO
      const lista = base[tipo] || []
      escribir({
        ...base,
        [tipo]: lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id],
        elegido: true,
      })
    },
    [perfil, escribir],
  )

  // «No tengo ninguna»: deja el perfil vacío pero MARCADO, para no volver a
  // preguntar en cada visita. Sin esto, la pantalla de bienvenida sería una
  // aduana infinita para quien come de todo.
  const marcarSinPreferencias = useCallback(() => {
    escribir({ dietas: [], alergenos: [], elegido: true })
  }, [escribir])

  // Cerrar la bienvenida conservando lo marcado (distinto de la de arriba,
  // que además vacía: confundirlas borraría lo que el cliente acaba de elegir).
  const confirmar = useCallback(() => {
    escribir({ ...(perfil || VACIO), elegido: true })
  }, [perfil, escribir])

  const limpiar = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      /* sin storage */
    }
    setPerfil(VACIO)
    try {
      window.dispatchEvent(new Event('sqf-preferencias'))
    } catch {
      /* entorno sin window */
    }
  }, [])

  const actual = perfil || VACIO
  return {
    dietas: actual.dietas,
    alergenos: actual.alergenos,
    // Lo que consume el motor de sustituciones: dietas y alérgenos juntos.
    claves: [...actual.dietas, ...actual.alergenos],
    elegido: actual.elegido,
    listas: perfil !== null,
    alternar,
    confirmar,
    marcarSinPreferencias,
    limpiar,
  }
}
