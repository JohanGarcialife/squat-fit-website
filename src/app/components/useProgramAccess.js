'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { handleApiError } from '@/app/components/handleApiError'

const API =
  process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app'

/**
 * Detección de accesos del panel del cliente (programa y curso Entrena en casa).
 *
 * La usan el Sidebar y las páginas Mi programa / Mi entreno / Mi cocina, todas
 * con los MISMOS criterios:
 *   - hasProgram        → GET /advice/by-user devuelve la fila del programa
 *                         (la sincronizan los webhooks de Stripe).
 *   - hasEntrenaCourse  → GET /course/by-user incluye un curso cuyo título
 *                         encaja con /entrena en casa/i.
 *
 * Para no repetir las dos llamadas en cada componente (Sidebar + página se
 * montan a la vez), la promesa se cachea a nivel de módulo por token: todos
 * comparten el mismo fetch y el resultado sobrevive a los cambios de ruta.
 *
 * Un 401 en cualquiera de las dos llamadas se trata con handleApiError
 * (logout + /login?redirect=<ruta actual>), igual que el resto del panel.
 */
let cache = { token: null, promise: null }

async function loadAccess(token) {
  const headers = { Authorization: `Bearer ${token}` }
  // El perfil viaja con las otras dos: este hook ya se comparte y se cachea por
  // token, así que sale gratis y evita que cada pantalla que necesite un dato
  // del usuario (el sexo, para saludar bien) monte su propia petición.
  const [adviceRes, coursesRes, infoRes] = await Promise.allSettled([
    axios.get(`${API}/api/v1/advice/by-user`, { headers }),
    axios.get(`${API}/api/v1/course/by-user`, { headers }),
    axios.get(`${API}/api/v1/user/info`, { headers }),
  ])

  // Sesión caducada: si cualquiera devuelve 401, propaga para re-login.
  for (const r of [adviceRes, coursesRes, infoRes]) {
    if (r.status === 'rejected' && r.reason?.response?.status === 401) {
      throw r.reason
    }
  }

  // advice/by-user: objeto = fila del programa; error (p. ej. 404) = sin programa.
  const adviceData = adviceRes.status === 'fulfilled' ? adviceRes.value.data : null
  const advice =
    adviceData && typeof adviceData === 'object'
      ? Array.isArray(adviceData)
        ? adviceData.length > 0
          ? adviceData[0]
          : null
        : adviceData
      : null

  const courses =
    coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data)
      ? coursesRes.value.data
      : []
  const hasEntrenaCourse = courses.some((c) =>
    /entrena en casa/i.test(c?.title || c?.name || '')
  )

  // Un fallo del perfil NO tumba el acceso al programa: sin él se saluda en
  // masculino genérico y ya, que es el comportamiento acordado para sexo
  // desconocido. Perder el programa entero por un 500 del perfil sería peor.
  const info = infoRes.status === 'fulfilled' ? infoRes.value.data : null
  const perfil = info?.data ?? info ?? null

  return {
    advice,
    hasProgram: !!advice,
    courses,
    hasEntrenaCourse,
    perfil,
    gender: perfil?.gender ?? null,
  }
}

const EMPTY = { advice: null, hasProgram: false, courses: [], hasEntrenaCourse: false, perfil: null, gender: null }

export function useProgramAccess() {
  const { token } = useAuthStore()
  // checked = las llamadas terminaron y los flags son fiables (evita esconder
  // o enseñar pestañas del Sidebar antes de saber la respuesta real).
  const [state, setState] = useState({ loading: true, checked: false, ...EMPTY })

  useEffect(() => {
    if (!token) {
      setState({ loading: false, checked: false, ...EMPTY })
      return
    }
    let alive = true
    if (cache.token !== token || !cache.promise) {
      cache = { token, promise: loadAccess(token) }
    }
    cache.promise
      .then((res) => {
        if (alive) setState({ loading: false, checked: true, ...res })
      })
      .catch((err) => {
        // No cachees un fallo: el siguiente montaje reintenta.
        if (cache.token === token) cache = { token: null, promise: null }
        if (handleApiError(err)) return
        if (alive) setState({ loading: false, checked: true, ...EMPTY })
      })
    return () => {
      alive = false
    }
  }, [token])

  return state
}
