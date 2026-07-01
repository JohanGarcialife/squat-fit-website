'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

// --- Esquema de Validación con Yup ---
const ContactSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre y apellidos son obligatorios'),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  whatsapp: Yup.string().required('El número de WhatsApp es obligatorio'),
  instagram: Yup.string().nullable(),
  motivo: Yup.string().required('Debes seleccionar un motivo'),
  contactarA: Yup.string().required('Debes seleccionar con quién quieres contactar'),
  mensaje: Yup.string().required('El mensaje no puede estar vacío').min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

const MOTIVOS = [
  'Duda sobre mis Asesorías',
  'Problema con la Biblioteca Digital / Recetas',
  'Duda o Problema con Cursos en Video',
  'Reporte de error en la plataforma',
  'Facturación o pagos',
  'Consulta general'
];

const CONTACTOS = [
  { value: 'Maria', label: 'María' },
  { value: 'Hamlet', label: 'Hamlet' },
  { value: 'Soporte', label: 'Soporte Técnico' }
];

export default function ContactPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/panel-contacto');
      return;
    }
  }, [token, router]);

  const formik = useFormik({
    initialValues: {
      nombre: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      whatsapp: user?.phone_number || '',
      instagram: '',
      motivo: '',
      contactarA: '',
      mensaje: ''
    },
    enableReinitialize: true,
    validationSchema: ContactSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!token || !user) {
        toast.error('Debes iniciar sesión para enviar un mensaje');
        return;
      }

      setIsSubmitting(true);
      try {
        // Mapear motivo a categoría del ticket del backend
        let category = 'general';
        if (values.motivo === 'Problema con la Biblioteca Digital / Recetas' || values.motivo === 'Duda o Problema con Cursos en Video') {
          category = 'technical';
        } else if (values.motivo === 'Facturación o pagos') {
          category = 'billing';
        } else if (values.motivo === 'Reporte de error en la plataforma') {
          category = 'bug_report';
        }

        const description = `
[CONTACTO PANEL]
Contacto solicitado con: ${values.contactarA}
Motivo: ${values.motivo}

DATOS DEL CLIENTE:
- Nombre: ${values.nombre}
- WhatsApp: ${values.whatsapp}
- Instagram: ${values.instagram || 'No proporcionado'}
- Email: ${values.email}

MENSAJE:
${values.mensaje}
        `.trim();

        const payload = {
          user_id: user.id || user.user_id,
          description,
          category,
          priority: 'medium'
        };

        await axios.post(
          'https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/support/backoffice/tickets',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
        
        // Resetear formulario pero conservar datos del usuario
        resetForm({
          values: {
            nombre: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
            email: user?.email || '',
            whatsapp: user?.phone_number || '',
            instagram: '',
            motivo: '',
            contactarA: '',
            mensaje: ''
          }
        });
      } catch (error) {
        console.error('Error al enviar ticket de contacto:', error);
        toast.error('Ocurrió un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  if (!token) return null;

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        
        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* ================= COLUMNA IZQUIERDA (Formulario) ================= */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
            <h1 className="text-5xl font-black text-[#FF690B]">Contacto</h1>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              
              {/* Nombre y Apellidos */}
              <div className="flex flex-col space-y-1">
                <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                  Nombre y apellidos*
                </label>
                <input
                  name="nombre"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nombre}
                  className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all"
                  placeholder="Tu nombre y apellidos"
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.nombre}</span>
                )}
              </div>

              {/* Grid Email / WhatsApp / Insta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                    Email*
                  </label>
                  <input
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all"
                    placeholder="Tu correo electrónico"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.email}</span>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                    Teléfono / WhatsApp*
                  </label>
                  <input
                    name="whatsapp"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.whatsapp}
                    className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all"
                    placeholder="Tu número con código de país (ej: +34...)"
                  />
                  {formik.touched.whatsapp && formik.errors.whatsapp && (
                    <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.whatsapp}</span>
                  )}
                </div>

                {/* Instagram */}
                <div className="flex flex-col space-y-1 md:col-span-2">
                  <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                    Instagram (Opcional)
                  </label>
                  <input
                    name="instagram"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.instagram}
                    className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all"
                    placeholder="Tu usuario de Instagram (ej: @usuario)"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div className="flex flex-col space-y-1">
                <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                  Motivo*
                </label>
                <select
                  name="motivo"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.motivo}
                  className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all cursor-pointer"
                >
                  <option value="" disabled>Selecciona el motivo de tu consulta</option>
                  {MOTIVOS.map((motivo, index) => (
                    <option key={index} value={motivo}>{motivo}</option>
                  ))}
                </select>
                {formik.touched.motivo && formik.errors.motivo && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.motivo}</span>
                )}
              </div>

              {/* ¿Con quién quieres contactar? */}
              <div className="flex flex-col space-y-1">
                <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                  ¿Con quién quieres contactar?*
                </label>
                <select
                  name="contactarA"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.contactarA}
                  className="w-full appearance-none bg-white border border-orange-300 rounded-2xl px-5 py-3 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all cursor-pointer"
                >
                  <option value="" disabled>Selecciona un destinatario</option>
                  {CONTACTOS.map((contacto, index) => (
                    <option key={index} value={contacto.value}>{contacto.label}</option>
                  ))}
                </select>
                {formik.touched.contactarA && formik.errors.contactarA && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.contactarA}</span>
                )}
              </div>

              {/* Mensaje */}
              <div className="flex flex-col space-y-1">
                <label className="text-[#FF690B] text-sm font-bold uppercase tracking-wider">
                  Comentarios
                </label>
                <textarea
                  name="mensaje"
                  rows={5}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.mensaje}
                  className="w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
                {formik.touched.mensaje && formik.errors.mensaje && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.mensaje}</span>
                )}
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3932C0] hover:bg-[#2e28a0] text-white font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </form>
          </div>

          {/* ================= COLUMNA DERECHA (Imagen de María) ================= */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-orange-100 shadow-xl">
              <Image
                src="/empleo.png"
                alt="María Squat Fit"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
