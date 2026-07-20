'use client';

// Formulario de PRELLAMADA «Aquí empieza tu cambio» (13.11).
// Página PÚBLICA sin login (decisión de Hamlet, 4.3): es el paso previo a la
// llamada de venta del programa. Preguntas y textos tomados del JSON exportado
// de Fluent Forms («Aqui empieza tu cambio.json», carpeta Formularios).
// Motor visual del onboarding (una pregunta por pantalla) + movimiento CSS
// del briefing (clases sf-* de form-motion.css).

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import GdprCheckbox from '@/app/components/GdprCheckbox';
import { normalizeName } from '@/app/components/nameUtils';

const BLUE = '#3932C0';
const ORANGE = '#FF690B';

// Enlace de reserva de la llamada. Hoy apunta a /contacto; cuando exista un
// calendario (Calendly o similar) basta con cambiar esta constante.
const BOOKING_URL = 'https://agenda.squatfit.es/sesion-diagnostica';

// Endpoint de guardado. El módulo de forms del backend (/api/v1/advice/…)
// exige sesión, y este formulario es público, así que de momento queda
// desactivado y la solicitud se guarda en localStorage (clave abajo).
// Cuando haya endpoint público: ponerlo aquí y el POST ya está preparado.
const SUBMIT_ENDPOINT = null; // p. ej. 'https://…/api/v1/advice/create-answer-form'
const STORAGE_KEY = 'sqf-prellamada-solicitudes';

// Pantallas del formulario: claves estables = atributos `name` del JSON.
const STEPS = [
  {
    type: 'intro',
    title: 'Inicia tu cambio',
    body: 'Responde estas preguntas para conocerte mejor antes de la llamada.\n\nSon 2 minutos. Responde con sinceridad: no es un examen.',
  },
  { type: 'nombre', title: 'Dime tu nombre y apellidos' },
  { type: 'number', key: 'edad', title: '¿Qué edad tienes?', min: 14, max: 99 },
  {
    type: 'radio', key: 'region_vives', title: '¿Dónde vives actualmente?',
    options: ['España / Europa', 'Estados Unidos', 'Latinoamérica'],
  },
  {
    type: 'radio', key: 'objetivo_principal',
    title: 'Si tuvieses que elegir una sola cosa, ¿qué te gustaría cambiar ahora mismo?',
    options: [
      'Perder grasa, que la ropa me quede mejor',
      'Ganar músculo para verme más fuerte',
      'Cambiar grasa por músculo',
      'Tener más energía y mejorar mi salud',
    ],
  },
  {
    type: 'checkbox', key: 'impide_lograr',
    title: '¿Qué es lo que más te está frenando ahora mismo?',
    subtitle: 'Puedes marcar varias',
    options: [
      'La falta de tiempo.',
      'No sé qué comer.',
      'No sé qué ejercicios hacer.',
      'Me cuesta ser constante.',
      'Intento cosas y no funcionan',
    ],
  },
  {
    type: 'radio', key: 'intentos',
    title: '¿Qué has probado hasta ahora para conseguirlo?',
    options: [
      'Dietas por mi cuenta',
      'Entrenar sin guía',
      'Entrenador / nutricionista',
      'Apps, retos o programas',
      'Nada serio todavía',
    ],
  },
  {
    type: 'radio', key: 'prioridad_para_ti',
    title: '¿Qué prioridad tiene para ti cambiar esto ahora mismo?',
    options: [
      'No es prioridad ahora',
      'Es baja prioridad, sin prisa',
      'Quiero mejorar, pero sin ir a tope',
      'Quiero cambiar de verdad',
      'Lo necesito ya, es prioridad total',
    ],
  },
  {
    type: 'text', key: 'empuja_a_cambiar', long: true,
    title: '¿Qué es lo que ya no quieres seguir sintiendo o viviendo hoy?',
    placeholder: 'Cuéntamelo con tus palabras…',
  },
  {
    type: 'radio', key: 'tiempo_y_esfuerzo',
    title: 'Si decides iniciar tu cambio, ¿qué tan comprometido estás con el proceso?',
    options: [
      'Voy por ello al 100 %',
      'Dispuesto, pero con dudas',
      'No lo tengo claro',
    ],
  },
  {
    type: 'radio', key: 'inversion',
    title: 'Si encontramos una solución que te encaje, ¿qué rango de inversión estás dispuesto a asumir?',
    options: [
      'Un programa con garantia de resultados 👉🏼 +350 € al mes',
      'Busco algo estructurado y sostenible 👉🏼 200–350 € al mes',
      'Prefiero algo más básico 👉🏼 150-200 € al mes',
    ],
  },
  {
    type: 'text', key: 'obstaculo_importante', long: true,
    title: '¿Hay algo que pueda dificultar que empieces ahora mismo?',
    placeholder: 'Horarios, viajes, lesiones, dudas…',
  },
  {
    type: 'radio', key: 'coach_squat_fit',
    title: '¿Quién será tu coach Squat Fit?',
    options: ['Voy con María 🙋🏻‍♀️', 'Voy con Hamlet 🙋🏻‍♂️'],
  },
  {
    type: 'text', key: 'peso_altura',
    title: 'Ahora, dime tu peso y altura',
    placeholder: 'Ej: 72 kg y 1,70 m',
  },
  { type: 'phone', key: 'phone', title: 'Déjame tu número para WhatsApp' },
  {
    type: 'text', key: 'instagram', optional: true,
    title: 'Si quieres, déjame tu Instagram 😊',
    subtitle: 'Opcional',
    placeholder: '@tuusuario',
  },
  { type: 'final', title: 'Último paso' },
];

const esPhoneLocalization = { ...esPhone, gb: 'Inglaterra' };

export default function EmpiezaTuCambioPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({
    first_name: '', last_name: '', edad: '', region_vives: '',
    objetivo_principal: '', impide_lograr: [], intentos: '',
    prioridad_para_ti: '', empuja_a_cambiar: '', tiempo_y_esfuerzo: '',
    inversion: '', obstaculo_importante: '', coach_squat_fit: '',
    peso_altura: '', phone: '', instagram: '',
  });
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const step = STEPS[index];
  const total = STEPS.length;
  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));

  const isValid = useMemo(() => {
    if (!step) return false;
    switch (step.type) {
      case 'intro':
        return true;
      case 'nombre':
        return answers.first_name.trim().length > 0 && answers.last_name.trim().length > 0;
      case 'number': {
        const n = parseInt(answers[step.key], 10);
        return !isNaN(n) && n >= step.min && n <= step.max;
      }
      case 'radio':
        return !!answers[step.key];
      case 'checkbox':
        return (answers[step.key] || []).length > 0;
      case 'text':
        return step.optional || answers[step.key].trim().length > 0;
      case 'phone':
        return String(answers.phone || '').replace(/\D/g, '').length >= 8;
      case 'final':
        return gdprAccepted;
      default:
        return true;
    }
  }, [step, answers, gdprAccepted]);

  const goNext = () => { if (isValid && index < total - 1) setIndex((i) => i + 1); };
  const goBack = () => setIndex((i) => Math.max(0, i - 1));

  const handleSubmit = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    const submission = {
      ...answers,
      // 15.16: nombre y apellidos normalizados solo al enviar, no al teclear.
      first_name: normalizeName(answers.first_name),
      last_name: normalizeName(answers.last_name),
      timestamp: new Date().toISOString(),
      origen: typeof window !== 'undefined' ? `web ${window.location.pathname}` : 'web',
    };
    try {
      if (SUBMIT_ENDPOINT) {
        const res = await fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // Fallback local mientras no hay endpoint público de forms.
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        prev.push(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
      }
      setSent(true);
    } catch (e) {
      console.error('prellamada submit', e);
      // Aunque falle el POST, no perdemos la solicitud del cliente.
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        prev.push(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
        setSent(true);
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round((index / (total - 1)) * 100);

  // ===== Pantalla de gracias =====
  if (sent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className="sf-screen-in max-w-lg flex flex-col items-center">
          <Image src="/LogotipoSquatfit.png" width={80} height={80} alt="Squad Fit" className="mb-8" />
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-extrabold mb-4" style={{ color: BLUE, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
            ¡Listo, {answers.first_name || 'crack'}!
          </h1>
          <p className="text-[#6B6BA8] text-lg leading-relaxed mb-8">
            Hemos recibido tus respuestas. El siguiente paso es agendar tu
            llamada para conocerte y ver cómo ayudarte a lograr tu cambio.
          </p>
          <Link
            href={BOOKING_URL}
            className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg text-center cursor-pointer"
            style={{ backgroundColor: ORANGE }}
          >
            Reservar mi llamada
          </Link>
          <Link href="/" className="mt-5 text-[#8B87C9] hover:text-[#3932C0] font-semibold transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* ===== IZQUIERDA: pregunta activa ===== */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-8 relative">
        {/* Barra de progreso */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16">
          <div className="flex-1 h-2.5 rounded-full bg-[#DEDCF5] overflow-hidden">
            <div className="h-full rounded-full sf-progress-fill" style={{ width: `${progress}%`, backgroundColor: BLUE }} />
          </div>
          <Link href="/programa" aria-label="Salir" className="text-[#8B87C9] hover:text-[#3932C0] transition-colors cursor-pointer text-xl font-bold px-1">
            ✕
          </Link>
        </div>

        {/* Contenido */}
        <div key={index} className="flex-1 flex flex-col max-w-xl w-full mx-auto sf-screen-in">
          <h1 className="font-extrabold leading-tight mb-3" style={{ color: BLUE, fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)' }}>
            {step.title}
          </h1>
          {step.subtitle && <p className="text-[#6B6BA8] text-base sm:text-lg mb-7">{step.subtitle}</p>}

          <div className="flex-1">
            {step.type === 'intro' && (
              <p className="text-[#3932C0] text-lg sm:text-2xl leading-relaxed whitespace-pre-line mt-4">{step.body}</p>
            )}

            {step.type === 'nombre' && (
              <div className="flex flex-col gap-4 max-w-md">
                <Field placeholder="Tu nombre" value={answers.first_name} onChange={(v) => set({ first_name: v })} autoFocus />
                <Field placeholder="Tus apellidos" value={answers.last_name} onChange={(v) => set({ last_name: v })} />
              </div>
            )}

            {step.type === 'number' && (
              <div className="max-w-xs">
                <div className="flex items-baseline gap-3 border-b-2 pb-2" style={{ borderColor: ORANGE }}>
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={answers[step.key]}
                    onChange={(e) => set({ [step.key]: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) })}
                    placeholder="0"
                    className="w-full bg-transparent font-extrabold outline-none placeholder:text-slate-300"
                    style={{ color: BLUE, fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                  />
                  <span className="text-2xl font-bold shrink-0" style={{ color: '#8B87C9' }}>años</span>
                </div>
              </div>
            )}

            {step.type === 'radio' && (
              <div className="flex flex-col gap-3 max-w-md">
                {step.options.map((opt, i) => {
                  const active = answers[step.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set({ [step.key]: opt })}
                      className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-base sm:text-[17px] cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                      style={active
                        ? { '--i': i, borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
                        : { '--i': i, borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === 'checkbox' && (
              <div className="flex flex-col gap-3 max-w-md">
                {step.options.map((opt, i) => {
                  const selected = (answers[step.key] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const cur = answers[step.key] || [];
                        set({ [step.key]: selected ? cur.filter((o) => o !== opt) : [...cur, opt] });
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 font-bold text-base sm:text-[17px] cursor-pointer text-left sf-choice sf-stagger ${selected ? 'is-selected' : ''}`}
                      style={selected
                        ? { '--i': i, borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
                        : { '--i': i, borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE }}
                    >
                      <span
                        className="w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-xs text-white"
                        style={{ borderColor: selected ? ORANGE : '#C6C3E8', backgroundColor: selected ? ORANGE : 'transparent' }}
                      >
                        {selected ? '✓' : ''}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === 'text' && (
              <div className="max-w-md">
                {step.long ? (
                  <textarea
                    autoFocus
                    rows={4}
                    value={answers[step.key]}
                    onChange={(e) => set({ [step.key]: e.target.value })}
                    placeholder={step.placeholder}
                    className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none"
                    style={{ borderColor: '#FBD5B8', color: ORANGE }}
                  />
                ) : (
                  <Field placeholder={step.placeholder} value={answers[step.key]} onChange={(v) => set({ [step.key]: v })} autoFocus />
                )}
              </div>
            )}

            {step.type === 'phone' && (
              <div className="max-w-md onb-phone">
                <PhoneInput
                  country={'es'}
                  preferredCountries={['es', 'pt', 'gb', 'fr', 'mx', 'ar', 'co', 'cl', 'us']}
                  localization={esPhoneLocalization}
                  value={answers.phone}
                  onChange={(phone) => set({ phone })}
                  inputClass="!w-full !rounded-2xl !border-2 !pl-14 !pr-4 !py-3.5 !h-auto !text-[#FF690B] !font-bold !bg-[#FFF9F5]"
                  containerClass="!w-full"
                  buttonClass="!bg-transparent !border-0 !rounded-l-2xl !pl-3"
                />
              </div>
            )}

            {step.type === 'final' && (
              <div className="mt-2 max-w-md">
                <p className="text-[#3932C0] text-lg sm:text-xl leading-relaxed mb-8">
                  Ya casi está, {answers.first_name || ''} 💪. Revisa que todo sea
                  correcto y envíame tus respuestas: te contactaré por WhatsApp
                  para agendar tu llamada.
                </p>
                <GdprCheckbox checked={gdprAccepted} onChange={setGdprAccepted} id="gdpr-prellamada" />
              </div>
            )}
          </div>
        </div>

        {/* Pie: Continuar + Atrás + contador */}
        <div className="max-w-xl w-full mx-auto mt-8">
          <button
            onClick={step.type === 'final' ? handleSubmit : goNext}
            disabled={!isValid || saving}
            className={`w-full rounded-2xl py-4 font-bold text-white text-lg cursor-pointer disabled:cursor-not-allowed sf-cta ${isValid && !saving ? 'is-enabled' : ''}`}
            style={{ backgroundColor: isValid && !saving ? BLUE : '#C6C3E8' }}
          >
            {saving ? 'Enviando…' : step.type === 'final' ? 'Enviar mis respuestas' : step.type === 'intro' ? 'Empezar' : 'Continuar'}
          </button>
          <div className="flex items-center justify-between mt-4">
            {index > 0 ? (
              <button onClick={goBack} className="text-[#8B87C9] hover:text-[#3932C0] font-semibold transition-colors cursor-pointer flex items-center gap-1">
                ‹ Atrás
              </button>
            ) : <span />}
            <span className="text-[#B4B1D6] font-semibold text-sm">{index + 1}/{total}</span>
          </div>
        </div>
      </div>

      {/* ===== DERECHA: logo (solo pantallas anchas) ===== */}
      <aside className="hidden lg:flex w-[38%] max-w-lg flex-col items-center justify-center bg-[#F3F2F9] px-10 py-12">
        <Image src="/LogotipoSquatfit.png" width={96} height={96} alt="Squad Fit" className="mb-10" />
        <p className="text-[#8B87C9] font-bold text-center leading-relaxed">
          Aquí empieza tu cambio.<br />2 minutos, {total - 2} preguntas.
        </p>
      </aside>

      <style jsx global>{`
        .onb-phone .react-tel-input .form-control { height: auto; }
      `}</style>
    </div>
  );
}

// Input de texto con el estilo naranja del onboarding.
function Field({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876]"
      style={{ borderColor: '#FBD5B8', color: ORANGE }}
    />
  );
}
