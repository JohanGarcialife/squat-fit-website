'use client'
import React, { useEffect, useState } from 'react'
import CourseTierCard from '@/app/components/CourseTierCard'
import { fetchTieredCourses } from '@/app/components/courseCatalog'

// Compra del curso Fuerte y Definid@ (15.1): UNA tarjeta con el selector
// Mensual / Anual / De por vida, con los precios reales del catálogo
// (mensual = suscripción; anual y permanente = pago único). Antes había tres
// tarjetas sueltas con precios desactualizados y un payload de pago inválido.
const COURSE_NAME = 'Fuerte y Definid@'

export default function CTO() {
  const [group, setGroup] = useState(null)

  useEffect(() => {
    fetchTieredCourses()
      .then((groups) => setGroup(groups.find((g) => g.baseName === COURSE_NAME) || null))
      .catch(() => setGroup(null))
  }, [])

  return (
    <div className='flex flex-col items-center justify-center my-16 px-4 md:px-0'>
      <p className='text-black max-w-2xl text-center text-xl mb-12'>
        Obtén el curso definitivo que te enseñará a <span className='font-bold'>transformar tu cuerpo</span> y no solo llegar al objetivo físico que siempre has querido sino a cómo <span className='font-bold'>mantenerlo</span> de por vida
      </p>

      {group ? (
        <CourseTierCard
          group={group}
          defaultTier='anual'
          subtitle='El curso que te enseña a construir tu mejor físico paso a paso.'
        />
      ) : (
        <div className="w-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3932C0]" />
        </div>
      )}
    </div>
  )
}
