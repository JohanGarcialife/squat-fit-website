'use client'
import React, { useEffect, useState } from 'react'
import CourseTierCard from '@/app/components/CourseTierCard'
import { fetchTieredCourses } from '@/app/components/courseCatalog'

// EL RESTO DEL CATÁLOGO DE CURSOS, EN LA WEB PÚBLICA.
//
// El problema que resuelve: /api/v1/catalog sirve SEIS cursos con precio real,
// pero esta página solo vende uno. El componente que los lista todos
// (CourseTierShop) vive únicamente en /panel-cursos, dentro del panel PRIVADO,
// así que quien no tiene cuenta no puede comprar los otros cinco en ningún
// sitio de la web pública — ni llegando por su cuenta ni llegando desde el
// recomendador, que los recomienda por su nombre y su precio.
//
// ───────────────────────────────────────────────────────────────────────────
// NACE APAGADO, Y ES A PROPÓSITO.
//
// La parte mecánica —listarlos, con sus tramos y su carrito— es código y la
// hago yo. Pero QUE se vendan aquí, en qué orden y con qué texto es decisión de
// producto: esta página es la landing de Fuerte y Definid@ de arriba abajo, y
// colgarle cinco cursos más al final puede canibalizar al buque insignia. Esa
// llamada no me toca, así que la dejo a un interruptor en vez de a un
// despliegue:
//
//     NEXT_PUBLIC_CATALOGO_CURSOS_PUBLICO=true    (en Vercel)
//
// Mismo patrón que NEXT_PUBLIC_SEQURA_READY. Encenderlo no necesita tocar
// código ni volver a desplegar la web; apagarlo tampoco.
// ───────────────────────────────────────────────────────────────────────────
const ENCENDIDO = process.env.NEXT_PUBLIC_CATALOGO_CURSOS_PUBLICO === 'true'

// El curso que YA vende esta página (lo compra el bloque CTO, más arriba). Se
// excluye de esta lista para no enseñarlo dos veces con dos tarjetas distintas.
const CURSO_DESTACADO = 'Fuerte y Definid@'

export default function OtrosCursos() {
  const [grupos, setGrupos] = useState(null)

  useEffect(() => {
    if (!ENCENDIDO) return
    fetchTieredCourses()
      .then((todos) => setGrupos(todos.filter((g) => g.baseName !== CURSO_DESTACADO)))
      .catch(() => setGrupos([]))
  }, [])

  // Apagado, o el catálogo no responde, o no hay más cursos que el destacado:
  // la página se queda exactamente como está hoy. Nada de esqueletos ni de
  // secciones vacías — si no hay nada que enseñar, no se enseña la sección.
  if (!ENCENDIDO) return null
  if (!grupos || grupos.length === 0) return null

  return (
    <div className='w-full bg-[#F8F9FC] py-16 px-4'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-bold text-center text-black mb-3'>
          Y si buscas otra cosa, mira el resto de cursos
        </h2>
        <p className='text-center text-lg text-slate-600 max-w-2xl mx-auto mb-12'>
          Cada uno va a un objetivo distinto. Puedes empezar por el mes y quedarte
          solo el tiempo que quieras.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center'>
          {grupos.map((grupo) => (
            <CourseTierCard key={grupo.baseName} group={grupo} />
          ))}
        </div>
      </div>
    </div>
  )
}
