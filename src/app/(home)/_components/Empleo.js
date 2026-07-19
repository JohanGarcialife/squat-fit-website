'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { ABOUT } from './aboutStyles'
import GdprCheckbox from '@/app/components/GdprCheckbox'

// Schema de validación
const validationSchema = Yup.object({
  nombre: Yup.string().required('El nombre es obligatorio'),
  apellidos: Yup.string().required('Los apellidos son obligatorios'),
  edad: Yup.number()
    .typeError('Debe ser un número válido')
    .integer('Debe ser un número entero')
    .min(16, 'La edad mínima es 16 años')
    .max(99, 'La edad máxima es 99 años')
    .required('La edad es obligatoria'),
  pais: Yup.string().required('El país de residencia es obligatorio'),
  ocupacion: Yup.string().required('La ocupación es obligatoria'),
  presentacion: Yup.string().required('La presentación es obligatoria'),
  interes: Yup.string().required('Este campo es obligatorio'),
  expectativa: Yup.string().required('La expectativa salarial es obligatoria'),
})

// Componente reutilizable para Input. `example` = placeholder de ejemplo
// (item 16: los placeholders son ejemplos, no el propio nombre del campo).
const FormInput = ({ label, name, type = 'text', as = 'input', example, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-[#FF6B00] text-sm mb-1 font-medium">
      {label}*
    </label>
    <Field
      as={as}
      type={type}
      name={name}
      placeholder={example || label}
      className={`border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] border-orange-200 ${
        as === 'textarea' ? 'h-32 resize-none' : ''
      }`}
      {...props}
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-xs mt-1"
    />
  </div>
)

export default function Empleo() {
  // Modal "rellena todos los campos" al intentar enviar incompleto (item 17)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [gdprAccepted, setGdprAccepted] = useState(false)

  const initialValues = {
    nombre: '',
    apellidos: '',
    edad: '',
    pais: '',
    ocupacion: '',
    presentacion: '',
    interes: '',
    expectativa: '',
  }

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Form Data:', values)
    alert('Solicitud enviada (Revisa la consola)')
    setSubmitting(false)
    resetForm()
  }

  return (
    <div className="animate-fadeIn font-sans">
      {/* SECCIÓN 1: HEADER + IMAGEN */}
      <div className="mb-14">
        <p className={ABOUT.eyebrow}>Trabaja con nosotros</p>
        <h1 className={`${ABOUT.h1} mt-2 mb-4`}>Únete al equipo</h1>
        <div className="relative w-full max-w-[300px] aspect-square mx-auto my-6">
          <Image src="/empleo.png" alt="Equipo Squad Fit" fill sizes="300px" className="object-contain" />
        </div>
        <div className="space-y-4">
          <p className={ABOUT.p}>
            En Squad Fit estamos construyendo un proyecto a largo plazo, con impacto real en la
            vida de las personas.
          </p>
          <p className={ABOUT.p}>
            No publicamos ofertas tradicionales con horario y sueldo cerrado, pero{' '}
            <span className="font-semibold text-gray-700">sí estamos abiertos a conocer perfiles
            que encajen con nuestra forma de trabajar.</span>
          </p>
          <p className={ABOUT.p}>
            Buscamos personas con iniciativa, responsabilidad y ganas de crecer dentro del proyecto.
          </p>
        </div>
      </div>

      {/* SECCIÓN 2: LO QUE SOLEMOS BUSCAR */}
      <div className="mt-12">
        <h2 className={ABOUT.h2}>Lo que solemos buscar</h2>
        <p className={`${ABOUT.p} mt-3`}>
          Estos son los perfiles que más sentido tienen dentro de Squad Fit:
        </p>
        <ul className="mt-4 space-y-1">
          {['Personal de ventas: Setters o Closers', 'Marketing de contenidos: copy, email, funnels', 'Paid Media o Ads: Meta, Google, etc.', 'Editor de vídeos cortos o largos', 'Dietistas o nutricionistas', 'Entrenadores de fuerza', 'Psicólogos con manejo en TCA'].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-[#FF690B] leading-7">•</span>
              <p className={ABOUT.p}>{t}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-5 leading-relaxed">
          En algunos roles (especialmente Setter y Closer), la colaboración suele empezar por comisión,
          con posibilidad de evolucionar a una posición más estable según el rendimiento, la implicación
          y el encaje con el equipo.
        </p>
      </div>

      {/* SECCIÓN 3: LO QUE NO BUSCAMOS */}
      <div className="mt-12">
        <h2 className={ABOUT.h2}>Lo que NO buscamos</h2>
        <p className={`${ABOUT.p} mt-3`}>
          Para evitar malentendidos, actualmente <span className="font-semibold text-gray-700">no estamos buscando:</span>
        </p>
        <ul className="mt-4 space-y-1">
          {['Desarrollo web', 'Diseño web', 'Colaboraciones con marcas de suplementación'].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-[#FF690B] leading-7">•</span>
              <p className={ABOUT.p}>{t}</p>
            </li>
          ))}
        </ul>
        <p className={`${ABOUT.p} mt-4`}>
          Los mensajes relacionados con estos perfiles no serán tenidos en cuenta.
        </p>
      </div>

      {/* SECCIÓN 4: FORMULARIO */}
      <div className="max-w-xl mt-12">
        <h2 className={`${ABOUT.h2} mb-6`}>Cómo contactarnos</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty, validateForm, setTouched, values }) => (
            <Form className="space-y-6">
              <FormInput label="Nombre" name="nombre" example="Ej: María" />
              <FormInput label="Apellidos" name="apellidos" example="Ej: García López" />
              <FormInput label="Edad" name="edad" type="number" min="16" max="99" example="Ej: 28 (entre 16 y 99)" />
              <FormInput label="País de residencia" name="pais" example="Ej: España" />

              <div className="flex flex-col">
                <label htmlFor="ocupacion" className="text-[#FF6B00] text-sm mb-1 font-medium">
                  Ocupación*
                </label>
                <Field
                  as="select"
                  name="ocupacion"
                  className="border rounded-lg p-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] border-orange-200"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="empleado">Empleado/a</option>
                  <option value="autonomo">Autónomo/a</option>
                  <option value="desempleado">Desempleado/a</option>
                  <option value="otro">Otro</option>
                </Field>
                <ErrorMessage
                  name="ocupacion"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <FormInput
                label="Breve presentación"
                name="presentacion"
                as="textarea"
                example="Cuéntanos brevemente quién eres y a qué te dedicas…"
              />
              <FormInput
                label="¿Por qué te interesa colaborar con Squad Fit?"
                name="interes"
                as="textarea"
                example="Ej: Me identifico con el proyecto y quiero aportar en…"
              />
              <FormInput
                label="Expectativa salarial"
                name="expectativa"
                example="Ej: 1.200 €/mes o por comisión"
              />

              {/* RGPD */}
              <GdprCheckbox checked={gdprAccepted} onChange={setGdprAccepted} id="gdpr-empleo" className="mt-2" />

              {/* Botón gris hasta que el formulario esté completo y válido; si
                  se intenta enviar incompleto, se marca todo y sale el modal. */}
              <button
                type="submit"
                disabled={!gdprAccepted}
                onClick={async (e) => {
                  const errors = await validateForm()
                  if (Object.keys(errors).length > 0) {
                    e.preventDefault()
                    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
                    setShowIncomplete(true)
                  }
                }}
                className={`w-full font-bold py-4 rounded-lg transition-colors mt-8 shadow-lg cursor-pointer disabled:cursor-not-allowed ${
                  isValid && dirty && gdprAccepted
                    ? 'bg-[#3B3B98] text-white hover:bg-[#2E2E80]'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {showIncomplete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5"
          onClick={() => setShowIncomplete(false)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-800 text-lg font-semibold mb-5">
              Rellena todos los campos para poder enviar tu solicitud
            </p>
            <button
              onClick={() => setShowIncomplete(false)}
              className="bg-[#FF690B] text-white font-bold px-8 py-2.5 rounded-full hover:bg-[#e55e09] transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
