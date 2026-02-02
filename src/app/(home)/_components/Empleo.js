'use client'
import React from 'react'
import Image from 'next/image'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

// Schema de validación
const validationSchema = Yup.object({
  nombre: Yup.string().required('El nombre es obligatorio'),
  apellidos: Yup.string().required('Los apellidos son obligatorios'),
  edad: Yup.number()
    .typeError('Debe ser un número válido')
    .positive('Debe ser una edad válida')
    .integer('Debe ser un número entero')
    .required('La edad es obligatoria'),
  pais: Yup.string().required('El país de residencia es obligatorio'),
  ocupacion: Yup.string().required('La ocupación es obligatoria'),
  presentacion: Yup.string().required('La presentación es obligatoria'),
  interes: Yup.string().required('Este campo es obligatorio'),
  expectativa: Yup.string().required('La expectativa salarial es obligatoria'),
})

// Componente reutilizable para Input
const FormInput = ({ label, name, type = 'text', as = 'input', ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-[#FF6B00] text-sm mb-1 font-medium">
      {label}*
    </label>
    <Field
      as={as}
      type={type}
      name={name}
      placeholder={label}
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
    <div className="max-w-6xl mx-auto px-4 py-16 font-sans">
      {/* SECCIÓN 1: HEADER + IMAGEN */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 animate-fadeIn">
        <div className="lg:w-1/2">
          <h1 className="text-8xl font-bold text-[#3B3B98] mb-8">Empleo</h1>
          <div className="space-y-6 text-gray-700 text-3xl leading-relaxed">
            <p>
              En Squat Fit estamos construyendo un proyecto a largo plazo, con
              impacto real en la vida de las personas.
            </p>
            <p>
              No publicamos ofertas tradicionales de empleo con horario y sueldo
              cerrado, pero <span className="font-bold">sí estamos abiertos a
              conocer perfiles que encajen con nuestra forma de trabajar.</span>
            </p>
            <p>
              Buscamos personas con iniciativa, responsabilidad y ganas de
              crecer dentro del proyecto.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
             {/* Imagen circular */}
            
                 <Image
                  src="/empleo.png" // Reutilizamos la imagen existente o la que el usuario prefiera
                  alt="Equipo Squat Fit"
                  width={528}
                  height={528}
                  className="object-contain"
                />
           
        </div>
      </div>

      {/* SECCIÓN 2: LO QUE SOLEMOS BUSCAR */}
      <div className="mb-16 animate-fadeIn">
        <h2 className="text-4xl font-bold text-[#FF6B00] mb-6">
          Lo que solemos buscar
        </h2>
        <p className="text-gray-700 mb-6 text-3xl">
          Estos son los perfiles que más sentido tienen dentro de Squat Fit:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-800 font-medium text-3xl ml-4">
          <li>Setter (ventas por mensaje)</li>
          <li>Closer (ventas telefónicas / videollamada)</li>
          <li>Marketing de contenidos (copy, email, funnels)</li>
          <li>Paid Media / Ads (Meta, Google, etc.)</li>
          <li>Editor/a de vídeo (Reels, YouTube, Shorts)</li>
          <li>Dietista-nutricionista</li>
          <li>Entrenador/a de fuerza</li>
          <li>Psicólogo/a especializado/a en TCA</li>
        </ul>
        <p className="text-gray-600 mt-6 text-base leading-relaxed max-w-4xl">
          En algunos roles (especialmente Setter y Closer), la colaboración
          suele empezar por comisión, con posibilidad de evolucionar a una
          posición más estable según el rendimiento, la implicación y el encaje
          con el equipo.
        </p>
      </div>

      {/* SECCIÓN 3: LO QUE NO BUSCAMOS */}
      <div className="mb-24 animate-fadeIn">
        <h2 className="text-4xl font-bold text-[#FF6B00] mb-6">
          Lo que NO buscamos
        </h2>
        <p className="text-gray-700 mb-6 text-3xl">
          Para evitar malentendidos, actualmente <span className="font-bold">no estamos buscando:</span>
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-800 font-medium text-3xl ml-4">
          <li>Desarrollo web</li>
          <li>Diseño web</li>
          <li>Colaboraciones con marcas de suplementación</li>
        </ul>
        <p className="text-gray-600 mt-6 text-3xl">
          Los mensajes relacionados con estos perfiles no serán tenidos en
          cuenta.
        </p>
      </div>

      {/* SECCIÓN 4: FORMULARIO */}
      <div className="max-w-xl animate-fadeIn">
        <h2 className="text-4xl font-bold text-[#FF6B00] mb-10">
          Cómo contactarnos
        </h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <FormInput label="Nombre" name="nombre" />
              <FormInput label="Apellidos" name="apellidos" />
              <FormInput label="Edad" name="edad" type="number" min="0" />
              <FormInput label="País de residencia" name="pais" />
              
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
              />
              <FormInput
                label="¿Por qué te interesa colaborar con Squat Fit?"
                name="interes"
                as="textarea"
              />
              <FormInput
                label="Expectativa salarial"
                name="expectativa"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3B3B98] text-white font-bold py-4 rounded-lg hover:bg-[#2E2E80] transition-colors mt-8 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
