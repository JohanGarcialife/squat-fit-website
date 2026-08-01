'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { handleApiError } from '@/app/components/handleApiError'

const API =
  process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app'

/**
 * Recetas del sistema — GET /api/v1/recipe/system (mismo hook que usan el
 * lector de un libro y la ficha de receta, así solo se pide una vez).
 *
 * El propio backend decide qué llega en la respuesta según el acceso del
 * usuario (RecipeService.getSystemRecipes, rama feat/muestras-gratis-y-
 * ranking-recetas del repo SquatFit): con acceso a la biblioteca, TODAS las
 * recetas activas; sin acceso, SOLO las marcadas `is_free_sample=true`, en
 * detalle completo. Este hook no decide nada por su cuenta — solo pinta lo
 * que ya llegó filtrado.
 *
 * OJO — hueco conocido y ya avisado al carril de backend (31-jul): hoy
 * `getSystemRecipes` comprueba el acceso a UN libro fijo (`books[0]`), no al
 * libro/versión concreto que se esté mirando; y la tabla `recipe` no tiene
 * ninguna columna que la relacione con un libro. Hasta que esas dos cosas
 * lleguen, cualquier intento de "recetas de ESTE libro" (ver
 * `recipesForBook` en libro/[id]/page.js) da un array vacío para todos los
 * libros — así que el lector sigue enseñando el PDF de siempre. Es lo
 * esperado, no un fallo de este hook.
 *
 * Misma caché por token a nivel de módulo que useProgramAccess.js, para no
 * repetir la llamada si el lector y la ficha de receta se visitan seguidos.
 */
let cache = { token: null, promise: null }

async function loadRecipes(token) {
  const res = await axios.get(`${API}/api/v1/recipe/system`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return Array.isArray(res.data) ? res.data : []
}

export function useSystemRecipes() {
  const { token } = useAuthStore()
  // checked = la llamada terminó (con o sin datos) — evita decidir "sin
  // recetas nativas" antes de tiempo mientras la petición sigue en vuelo.
  const [state, setState] = useState({ loading: true, checked: false, recipes: [] })

  useEffect(() => {
    if (!token) {
      setState({ loading: false, checked: false, recipes: [] })
      return
    }
    let alive = true
    if (cache.token !== token || !cache.promise) {
      cache = { token, promise: loadRecipes(token) }
    }
    cache.promise
      .then((recipes) => {
        if (alive) setState({ loading: false, checked: true, recipes })
      })
      .catch((err) => {
        // No cachees un fallo: el siguiente montaje reintenta.
        if (cache.token === token) cache = { token: null, promise: null }
        if (handleApiError(err)) return
        // Degradado: sin recetas nativas, nunca una pantalla rota. El lector
        // del libro cae de vuelta al PDF, que es justo lo que debe pasar
        // ante cualquier fallo de esta llamada.
        if (alive) setState({ loading: false, checked: true, recipes: [] })
      })
    return () => {
      alive = false
    }
  }, [token])

  return state
}
