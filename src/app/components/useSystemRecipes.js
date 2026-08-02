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
 * CORREGIDO el 3-ago: la mitad de este aviso ya no es verdad y decía lo
 * contrario de lo que pasa, que es el mismo fallo que arregló el PR #107.
 * La tabla `recipe` SÍ tiene columna de libro desde la migración
 * `20260731210000_add_book_id_to_recipe`, y está sembrada con 149 recetas
 * (70 del Volumen 1 y 79 del Volumen 2), así que `recipesForBook` en
 * libro/[id]/page.js casa y el lector enseña la lista nativa, no el PDF.
 *
 * Lo que SÍ sigue abierto del aviso original: `getSystemRecipes` comprueba el
 * acceso contra UN libro fijo (`books[0]`), no contra el libro/versión que se
 * esté mirando. Con dos libros de cocina eso no se nota, pero se notará al
 * añadir el tercero.
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
