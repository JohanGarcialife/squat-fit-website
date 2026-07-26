'use client';

// Formulario de PRELLAMADA «Aquí empieza tu cambio» (13.11).
// Página PÚBLICA sin login (decisión de Hamlet, 4.3): es el paso previo a la
// llamada de venta del programa. Preguntas y textos tomados del JSON exportado
// de Fluent Forms («Aqui empieza tu cambio.json», carpeta Formularios).
// Motor visual del onboarding (una pregunta por pantalla) + movimiento CSS
// del briefing (clases sf-* de form-motion.css).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import GdprCheckbox from '@/app/components/GdprCheckbox';
import { normalizeName } from '@/app/components/nameUtils';
import TextareaMeter from '@/app/components/TextareaMeter';
import Typewriter from '@/app/components/Typewriter';
import { ExitButton, BackButton, StepCounter, FormAside, StepsDrawer, SoundButton, useMicroFeedback, MicroFeedback } from '@/app/components/FormChrome';
import { playSelect, playAdvance, playFinish, playKeypress, unlockAudio } from '@/app/components/formSounds';

const BLUE = '#3932C0';
const ORANGE = '#FF690B';

// Enlace de reserva de la llamada. Hoy apunta a /contacto; cuando exista un
// calendario (Calendly o similar) basta con cambiar esta constante.
const BOOKING_URL = 'https://agenda.squatfit.es/sesion-diagnostica';

// Endpoint público de forms (lote 4, 20-jul-2026): guarda la solicitud en el
// backend sin sesión, con rate-limit y honeypot. form_id estable sembrado por
// la migración del backend (Prellamada — Aquí empieza tu cambio).
const SUBMIT_ENDPOINT = 'https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/forms/public-answer';
const PRELLAMADA_FORM_ID = 'f0a11e00-0000-4000-a000-000000000001';
const STORAGE_KEY = 'sqf-prellamada-solicitudes';

// Fases: agrupan las pantallas para la columna lateral y el panel de móvil.
const PHASES = [
  'Sobre ti', 'Tu objetivo', 'Qué te frena', 'Tu prioridad',
  'Tu compromiso', 'Tu situación', 'Cómo te contactamos',
];

// A qué fase pertenece cada pantalla (por su clave o su tipo).
const PHASE_BY_KEY = {
  nombre: 'Sobre ti', edad: 'Sobre ti', region_vives: 'Sobre ti',
  objetivo_principal: 'Tu objetivo',
  impide_lograr: 'Qué te frena', intentos: 'Qué te frena',
  prioridad_para_ti: 'Tu prioridad', empuja_a_cambiar: 'Tu prioridad',
  tiempo_y_esfuerzo: 'Tu compromiso', inversion: 'Tu compromiso',
  obstaculo_importante: 'Tu situación', coach_squat_fit: 'Tu situación',
  peso_altura: 'Tu situación',
  phone: 'Cómo te contactamos', instagram: 'Cómo te contactamos',
  final: 'Cómo te contactamos',
};
const phaseOf = (step) => PHASE_BY_KEY[step?.key || step?.type] || null;

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
    type: 'text', key: 'empuja_a_cambiar', long: true, targetChars: 170,
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
    type: 'text', key: 'obstaculo_importante', long: true, targetChars: 130,
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

// El título se escribe algo más rápido que el cuerpo del texto.
const TITLE_SPEED = 11;

// Pausa entre pulsar Continuar y que entre la pantalla siguiente.
const ADVANCE_DELAY = 520;

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
  const [stepsOpen, setStepsOpen] = useState(false);
  const { mensaje: gesto, marcar: marcarGesto } = useMicroFeedback();
  // Portada: nada se escribe hasta que el lead pulsa «Empezar». Ese clic es el
  // gesto que el navegador exige para dejar sonar el audio; sin él, el tecleo de
  // la primera pantalla se perdería en silencio.
  const [started, setStarted] = useState(false);
  // El contenido espera a que termine de escribirse el título.
  const [titleDone, setTitleDone] = useState(false);
  // Y el botón espera a que termine de escribirse TODO el texto de la pantalla.
  const [bodyDone, setBodyDone] = useState(false);
  // Pasos ya vistos: al volver atrás el texto sale de golpe (ya se leyó).
  const seenSteps = useRef(new Set());

  const step = STEPS[index];
  const total = STEPS.length;
  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));
  // Elegir una opción: mismo `set` pero con su sonido.
  const choose = (patch) => { playSelect(); set(patch); };


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

  const stepId = step ? `${step.key || step.type}-${index}` : '';
  // Se congela por paso: si no, cualquier re-render (marcar una opción, teclear)
  // lo pondría a true y cortaría el mecanográfico a medias.
  const alreadySeen = useMemo(() => seenSteps.current.has(stepId), [stepId]);

  // El contenido aparece cuando el título ha terminado de escribirse. Se calcula
  // por tiempo (longitud × velocidad) en vez de esperar un aviso del hijo: así
  // no depende del orden en que React dispara los efectos.
  useEffect(() => {
    if (!stepId || !started) return undefined;
    const visto = seenSteps.current.has(stepId);
    seenSteps.current.add(stepId);
    if (visto) { setTitleDone(true); setBodyDone(true); return undefined; }
    setTitleDone(false);
    setBodyDone(false);
    const ms = 150 + (step?.title?.length || 0) * TITLE_SPEED;
    const t = setTimeout(() => setTitleDone(true), ms);
    return () => clearTimeout(t);
  }, [stepId, step?.title, started]);

  // El botón de avanzar no se enciende hasta que la pantalla ha acabado de
  // escribirse: la intro espera a su párrafo; el resto, al título (debajo van
  // campos o casillas, que ya se pueden usar en cuanto aparecen).
  const contenidoListo = alreadySeen || (step?.type === 'intro' ? bodyDone : titleDone);
  const puedeAvanzar = isValid && contenidoListo;

  const goNext = () => {
    if (!puedeAvanzar || index >= total - 1) return;
    playAdvance();
    if (step.type !== 'intro') marcarGesto();
    // Respiro: si la pregunta siguiente entra de golpe, se atropella con el
    // sonido de avance y la sensación es de ir a empujones.
    setTimeout(() => setIndex((i) => i + 1), ADVANCE_DELAY);
  };
  const goBack = () => setIndex((i) => Math.max(0, i - 1));

  // Volver a una sección ya completada desde el mapa de navegación.
  const goToPhase = (fase) => {
    const destino = STEPS.findIndex((st) => phaseOf(st) === fase);
    if (destino > -1 && destino < index) setIndex(destino);
  };

  const handleSubmit = async () => {
    if (!puedeAvanzar || saving) return;
    playFinish();
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
        // Contrato de POST /forms/public-answer: metadatos arriba, el resto de
        // respuestas como pares {question, answer}. website = honeypot vacío.
        const META_KEYS = ['first_name', 'last_name', 'phone', 'timestamp', 'origen'];
        const body = {
          form_id: PRELLAMADA_FORM_ID,
          name: [submission.first_name, submission.last_name].filter(Boolean).join(' '),
          phone: String(submission.phone || ''),
          answers: Object.entries(submission)
            .filter(([k]) => !META_KEYS.includes(k))
            .map(([question, answer]) => ({ question, answer })),
          source: submission.origen,
          website: '',
        };
        const res = await fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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

  // Enter = Continuar (o Enviar en el último paso) si la respuesta es válida.
  // EXCEPCIÓN: en los textarea (párrafos) Enter hace su salto de línea normal.
  const enterRef = useRef(null);
  enterRef.current = () => {
    if (sent || saving || !step) return;
    if (step.type === 'final') handleSubmit();
    else goNext();
  };
  useEffect(() => {
    const onKey = (e) => {
      const escribiendo = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      // Tecleo discreto mientras el usuario escribe en un campo.
      if (escribiendo && !e.repeat && (e.key.length === 1 || e.key === 'Backspace')) playKeypress();
      if (e.key !== 'Enter' || e.repeat || e.isComposing) return;
      const t = e.target;
      const enCampo = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');

      // MÓVIL (pantalla táctil): Enter cierra el teclado, NO avanza. Avanzar
      // desde el teclado ocultaba preguntas con más de un campo.
      const tactil = window.matchMedia?.('(pointer: coarse)').matches;
      if (tactil) {
        if (enCampo) { e.preventDefault(); t.blur(); }
        return;
      }

      if (t && t.tagName === 'TEXTAREA') return; // salto de línea normal
      if (t && t.closest && t.closest('a')) return; // no pisar enlaces (✕ salir)
      e.preventDefault();
      enterRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // ===== Portada =====
  // Existe por dos razones. La de forma: entrar a un formulario con el texto ya
  // escribiéndose no da tiempo a situarse. Y la de fondo: el navegador no deja
  // sonar nada hasta que el usuario toca algo, así que sin este botón la primera
  // pantalla se escribiría en silencio y el lead se perdería el efecto entero.
  if (!started) {
    return (
      <div className="min-h-[100svh] w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className="sf-screen-in max-w-lg flex flex-col items-center">
          <Image src="/LogotipoSquatfit.png" width={72} height={72} alt="Squad Fit" className="mb-8" />
          <h1 className="font-extrabold mb-4" style={{ color: BLUE, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
            Vamos a conocerte
          </h1>
          <p className="text-[#6B6BA8] text-lg leading-relaxed mb-9">
            Son unas preguntas rápidas sobre ti y tu objetivo. Tómate tu tiempo:
            cuanto mejor te conozca, mejor podré ayudarte en la llamada.
          </p>
          <button
            type="button"
            onClick={() => { unlockAudio(); playAdvance(); setStarted(true); }}
            className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg cursor-pointer"
            style={{ backgroundColor: BLUE }}
          >
            Empezar
          </button>
          <p className="mt-5 text-sm text-[#8B87C9]">
            Se acompaña de sonido. Puedes quitarlo cuando quieras con el altavoz
            de arriba.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] lg:min-h-screen w-full flex">
      {/* ===== IZQUIERDA: pregunta activa ===== */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8 relative">
        {/* Barra de progreso */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16">
          <div className="flex-1 h-2.5 rounded-full bg-[#DEDCF5] overflow-hidden">
            <div className="h-full rounded-full sf-progress-fill" style={{ width: `${progress}%`, backgroundColor: BLUE }} />
          </div>
          <SoundButton />
          <ExitButton href="/programa" />
        </div>

        {/* Contenido */}
        <div key={index} className="flex-1 flex flex-col max-w-xl w-full mx-auto sf-screen-in">
          <Typewriter
            as="h1"
            key={stepId}
            text={step.title}
            speed={TITLE_SPEED}
            instant={alreadySeen}
            sound="title"
            className="font-extrabold leading-tight mb-3"
            style={{ color: BLUE, fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          />
          {step.subtitle && titleDone && (
            <p className="text-[#6B6BA8] text-base sm:text-lg mb-7 sf-stagger">{step.subtitle}</p>
          )}

          {/* <form>: en iOS da los botones nativos ‹ › del teclado para saltar
              entre campos. No envía: el envío va por el botón del pie. */}
          <form className="flex-1" onSubmit={(e) => e.preventDefault()}>
            {/* No basta con ocultarlo: si se monta, el texto se escribe (y suena)
                por detrás mientras el título aún no ha terminado. */}
            {titleDone && (<>
            {step.type === 'intro' && (
              <Typewriter
                key={`body-${stepId}`}
                text={step.body}
                speed={19}
                startDelay={160}
                caret
                instant={alreadySeen}
                sound="body"
                onDone={() => setBodyDone(true)}
                className="text-[#3932C0] text-lg sm:text-2xl leading-relaxed mt-4"
              />
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
                      onClick={() => choose({ [step.key]: opt })}
                      className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
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
                        choose({ [step.key]: selected ? cur.filter((o) => o !== opt) : [...cur, opt] });
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg cursor-pointer text-left sf-choice sf-stagger ${selected ? 'is-selected' : ''}`}
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
                  <>
                    <textarea
                      autoFocus
                      rows={4}
                      value={answers[step.key]}
                      onChange={(e) => set({ [step.key]: e.target.value })}
                      placeholder={step.placeholder}
                      className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none"
                      style={{ borderColor: '#FBD5B8', color: ORANGE }}
                    />
                    <TextareaMeter value={answers[step.key]} targetChars={step.targetChars} />
                  </>
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
            </>)}
          </form>
        </div>

        {/* Pie: Continuar + Atrás + contador */}
        <div className="max-w-xl w-full mx-auto mt-8">
          <div className="h-9 mb-1 flex items-end justify-center">
            <MicroFeedback mensaje={gesto} />
          </div>
          <button
            onClick={step.type === 'final' ? handleSubmit : goNext}
            disabled={!puedeAvanzar || saving}
            className={`w-full rounded-2xl py-4 font-bold text-white text-lg cursor-pointer disabled:cursor-not-allowed sf-cta ${puedeAvanzar && !saving ? 'is-enabled' : ''}`}
            style={{ backgroundColor: puedeAvanzar && !saving ? BLUE : '#C6C3E8' }}
          >
            {saving ? 'Enviando…' : step.type === 'final' ? 'Enviar mis respuestas' : step.type === 'intro' ? 'Empezar' : 'Continuar'}
          </button>
          <div className="flex items-center justify-between mt-4">
            {index > 0 ? <BackButton onClick={goBack} /> : <span />}
            <StepCounter index={index} total={total} onOpen={() => setStepsOpen(true)} />
          </div>
        </div>
      </div>

      {/* ===== DERECHA: logo + fases (escritorio) ===== */}
      <FormAside
        title="Aquí empieza tu cambio"
        subtitle={`2 minutos, ${total - 2} preguntas`}
        phases={PHASES}
        currentPhase={phaseOf(step)}
        onGoTo={goToPhase}
      />

      {/* Panel de pasos en móvil (desde el contador) */}
      <StepsDrawer
        open={stepsOpen}
        onClose={() => setStepsOpen(false)}
        title="Aquí empieza tu cambio"
        phases={PHASES}
        currentPhase={phaseOf(step)}
        index={index}
        total={total}
        onGoTo={goToPhase}
      />

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
