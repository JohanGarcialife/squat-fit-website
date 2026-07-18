'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Check } from 'lucide-react';
import AccessNotice from '@/app/components/AccessNotice';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// --- Esquema de Validación con Yup ---
const ContactSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre y apellidos son obligatorios'),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  whatsapp: Yup.string().required('El número de WhatsApp es obligatorio'),
  instagram: Yup.string().nullable(),
  motivo: Yup.string().required('Debes seleccionar un motivo'),
  contactarA: Yup.string().required('Debes elegir con quién quieres contactar'),
  mensaje: Yup.string().required('El mensaje no puede estar vacío').min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

const MOTIVOS = [
  'Información sobre programas / asesorías',
  'Dudas antes de comprar',
  'Soporte de un curso ya comprado',
  'Acceso a libros o contenido digital',
  'Problemas técnicos con la web',
  'Pagos, facturación o suscripciones',
  'Colaboraciones o propuestas profesionales',
  'Prensa, entrevistas o eventos',
  'Feedback o sugerencias',
  'Otro motivo',
];

// Destinatarios como tarjetas con foto. `defaultMotivo` prerrellena el motivo
// al elegir (sin pisar lo que el usuario ya haya seleccionado).
const CONTACTOS = [
  {
    value: 'Maria',
    label: 'María',
    role: 'Nutrición y asesoría',
    photo: '/contacto-maria.jpg',
    defaultMotivo: 'Información sobre programas / asesorías',
    line: 'Te ayuda con tu plan de nutrición, asesorías y dudas sobre tu progreso.',
  },
  {
    value: 'Hamlet',
    label: 'Hamlet',
    role: 'Entrenamiento y asesoría',
    photo: '/contacto-hamlet.jpg',
    defaultMotivo: 'Información sobre programas / asesorías',
    line: 'Te ayuda con tu entrenamiento, técnica y planificación de fuerza.',
  },
  {
    value: 'Soporte',
    label: 'Soporte Técnico',
    role: 'Web, accesos y pagos',
    photo: '/contacto-soporte.png',
    defaultMotivo: 'Problemas técnicos con la web',
    line: 'Resuelve incidencias con la web, accesos a tus cursos, pagos y facturación.',
  },
];

export default function ContactPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sin sesión, el render muestra el aviso de acceso (no redirigimos en seco).

  const formik = useFormik({
    initialValues: {
      nombre: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      whatsapp: user?.phone_number || '',
      instagram: '',
      motivo: '',
      contactarA: 'Maria', // María preseleccionada
      mensaje: '',
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
        // Mapear motivo a categoría del ticket (opciones 3, 4 y 5 → technical/devs,
        // opción 6 → billing, resto → general).
        let category = 'general';
        const motivoIndex = MOTIVOS.indexOf(values.motivo) + 1;
        if (motivoIndex === 3 || motivoIndex === 4 || motivoIndex === 5) category = 'technical';
        else if (motivoIndex === 6) category = 'billing';

        const description = `
[CONTACTO PANEL]
Destinatario: ${values.contactarA}
Motivo (${motivoIndex}): ${values.motivo}
Ruta de Correo: ${category === 'technical' ? 'Devs' : 'Ventas'}

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
          priority: 'medium',
        };

        await axios.post(`${API}/api/v1/support/backoffice/tickets`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('¡Mensaje enviado con éxito! Te responderemos pronto.');

        resetForm({
          values: {
            nombre: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
            email: user?.email || '',
            whatsapp: user?.phone_number || '',
            instagram: '',
            motivo: '',
            contactarA: values.contactarA, // mantiene el destinatario elegido
            mensaje: '',
          },
        });
      } catch (error) {
        console.error('Error al enviar ticket de contacto:', error);
        toast.error('Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Prefill por deep-link opcional: /panel-contacto?destinatario=Soporte&motivo=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('destinatario');
    const mot = params.get('motivo');
    if (dest && CONTACTOS.some((c) => c.value === dest)) formik.setFieldValue('contactarA', dest);
    if (mot) formik.setFieldValue('motivo', mot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elegir destinatario: fija el valor y prerrellena el motivo si está vacío.
  const selectContacto = (value) => {
    formik.setFieldValue('contactarA', value);
    const c = CONTACTOS.find((x) => x.value === value);
    if (c && !formik.values.motivo) formik.setFieldValue('motivo', c.defaultMotivo);
  };

  const selected = CONTACTOS.find((c) => c.value === formik.values.contactarA) || CONTACTOS[0];

  const inputClass =
    'w-full border border-orange-300 rounded-2xl px-5 py-3 placeholder-orange-200 text-gray-700 outline-none focus:border-[#FF690B] focus:ring-1 focus:ring-[#FF690B] transition-all';
  const labelClass = 'text-[#FF690B] text-sm font-bold uppercase tracking-wider';

  if (!token) return <AccessNotice redirect="/panel-contacto" />;

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-24">
        {/* Grid: en desktop estrecho el formulario ocupa todo; el hero solo en xl+ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* ============ FORMULARIO ============ */}
          <div className="xl:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
            <h1 className="text-4xl sm:text-5xl font-black text-[#FF690B] mb-2">Contacto</h1>
            <p className="text-slate-500 mb-8">Elige con quién quieres hablar y cuéntanos en qué podemos ayudarte.</p>

            {/* Destinatario: tarjetas con foto */}
            <div className="mb-8">
              <label className={`${labelClass} block mb-3`}>¿Con quién quieres contactar?*</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONTACTOS.map((c) => {
                  const active = formik.values.contactarA === c.value;
                  return (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => selectContacto(c.value)}
                      className={`relative flex items-center gap-3 sm:flex-col sm:items-center sm:text-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        active
                          ? 'border-[#FF690B] bg-[#FFF6F0] shadow-sm'
                          : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/40'
                      }`}
                    >
                      {active && (
                        <span className="absolute top-2 right-2 bg-[#FF690B] text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                      <div
                        className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shrink-0 ${
                          active ? 'border-[#FF690B]' : 'border-slate-100'
                        }`}
                      >
                        <Image src={c.photo} alt={c.label} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="sm:mt-2 min-w-0">
                        <p className={`font-extrabold leading-tight ${active ? 'text-[#FF690B]' : 'text-[#363C98]'}`}>
                          {c.label}
                        </p>
                        <p className="text-slate-400 text-xs font-semibold leading-tight mt-0.5">{c.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {formik.touched.contactarA && formik.errors.contactarA && (
                <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.contactarA}</span>
              )}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Nombre y apellidos*</label>
                <input
                  name="nombre"
                  type="text"
                  autoCapitalize="words"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nombre}
                  className={inputClass}
                  placeholder="Tu nombre y apellidos"
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.nombre}</span>
                )}
              </div>

              {/* Email / WhatsApp / Instagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1">
                  <label className={labelClass}>Email*</label>
                  <input
                    name="email"
                    type="email"
                    autoCapitalize="none"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={inputClass}
                    placeholder="Tu correo electrónico"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.email}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  <label className={labelClass}>Teléfono / WhatsApp*</label>
                  <input
                    name="whatsapp"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.whatsapp}
                    className={inputClass}
                    placeholder="Tu número (ej: +34...)"
                  />
                  {formik.touched.whatsapp && formik.errors.whatsapp && (
                    <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.whatsapp}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-1 md:col-span-2">
                  <label className={labelClass}>Instagram (opcional)</label>
                  <input
                    name="instagram"
                    type="text"
                    autoCapitalize="none"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.instagram}
                    className={inputClass}
                    placeholder="Tu usuario (ej: @usuario)"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Motivo*</label>
                <select
                  name="motivo"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.motivo}
                  className={`${inputClass} appearance-none bg-white cursor-pointer`}
                >
                  <option value="" disabled>
                    Selecciona el motivo de tu consulta
                  </option>
                  {MOTIVOS.map((motivo, index) => (
                    <option key={index} value={motivo}>
                      {motivo}
                    </option>
                  ))}
                </select>
                {formik.touched.motivo && formik.errors.motivo && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.motivo}</span>
                )}
              </div>

              {/* Mensaje */}
              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Tu mensaje*</label>
                <textarea
                  name="mensaje"
                  rows={5}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.mensaje}
                  className={`${inputClass} resize-none`}
                  placeholder={`Escribe aquí tu mensaje para ${selected.label}…`}
                />
                {formik.touched.mensaje && formik.errors.mensaje && (
                  <span className="text-red-500 text-xs font-semibold pl-2">{formik.errors.mensaje}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3932C0] hover:bg-[#2e28a0] text-white font-bold py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Enviando…
                  </>
                ) : (
                  `Enviar a ${selected.label}`
                )}
              </button>
            </form>
          </div>

          {/* ============ HERO DEL DESTINATARIO (solo en pantallas anchas) ============ */}
          <div className="hidden xl:flex flex-col items-center text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-10">
            <div className="relative w-56 h-56 rounded-full overflow-hidden border-8 border-orange-100 shadow-xl">
              <Image src={selected.photo} alt={selected.label} fill sizes="224px" priority className="object-cover" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#363C98] mt-6">{selected.label}</h2>
            <p className="text-[#FF690B] font-bold text-sm mt-1">{selected.role}</p>
            <p className="text-slate-500 text-sm leading-relaxed mt-4">{selected.line}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
