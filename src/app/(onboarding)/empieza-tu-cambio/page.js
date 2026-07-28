'use client';

// Formulario de PRELLAMADA «Aquí empieza tu cambio» (13.11).
// Página PÚBLICA sin login (decisión de Hamlet, 4.3): es el paso previo a la
// llamada de venta del programa. Preguntas y textos tomados del JSON exportado
// de Fluent Forms («Aqui empieza tu cambio.json», carpeta Formularios).
// Motor visual del onboarding (una pregunta por pantalla) + movimiento CSS
// del briefing (clases sf-* de form-motion.css).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import GdprCheckbox from '@/app/components/GdprCheckbox';
import { normalizeName } from '@/app/components/nameUtils';
import TextareaMeter from '@/app/components/TextareaMeter';
import Typewriter from '@/app/components/Typewriter';
import { ExitButton, BackButton, StepCounter, FormAside, StepsDrawer, SoundButton, useMicroFeedback, PausaPantalla, PAUSA_MS, ChildField, SalidaDialogo } from '@/app/components/FormChrome';
import { playSelect, playAdvance, playFinish, playKeypress, unlockAudio } from '@/app/components/formSounds';
import { PAISES_EUROPA, PAISES_LATAM } from '@/app/components/paises';
import LogoEspagueti from '@/app/components/LogoEspagueti';
import { guardarProgreso, leerProgreso, borrarProgreso } from '@/app/components/formProgress';
import { useAuthStore } from '@/stores/auth.store';
import { moverFocoOpciones, elegirOpcionEnfocada, escribiendoEnCampo } from '@/app/components/formOptionKeys';

const BLUE = '#363C98';
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
    options: ['Europa', 'Estados Unidos', 'Latinoamérica'],
    // Al elegir una opción con hijo se despliega debajo, colgando de ella, el
    // selector del país concreto. Hasta que no se elija país, no se avanza.
    hijos: {
      Europa: { key: 'pais_vives', etiqueta: '¿De qué país?', opciones: PAISES_EUROPA },
      Latinoamérica: { key: 'pais_vives', etiqueta: '¿De qué país?', opciones: PAISES_LATAM },
    },
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

// Lo que tarda la portada en apartarse. Tiene que cuadrar con
// --ms-portada-out de form-motion.css.
const PORTADA_OUT_MS = 1200;

// Identificador del progreso guardado en el navegador.
// Traducción de nuestro utm_source al vocabulario de orígenes del back office.
const CRM_SOURCE = {
  youtube: 'youtube',
  instagram: 'ig',
  email: 'email',
  tiktok: 'otro',
  guia: 'web',
};

const FORM_ID = 'prellamada';
const FORM_URL = '/empieza-tu-cambio';

const esPhoneLocalization = { ...esPhone, gb: 'Inglaterra' };

// ── Prellenado desde la cuenta (15.x, pedido por María) ──────────────────────
// La página es pública, pero mucha gente llega ya con la sesión iniciada. A esos
// no se les vuelve a preguntar el nombre ni la edad: se leen de su perfil y esas
// pantallas se saltan. Solo se saltan las que quedan REALMENTE contestadas: si el
// perfil no tiene fecha de nacimiento, la pantalla de la edad se sigue enseñando.
const USER_INFO_URL =
  `${process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app'}/api/v1/user/info`;

// Años cumplidos a partir de la fecha de nacimiento del perfil (ISO).
function edadDesdeNacimiento(iso) {
  if (!iso) return '';
  const nac = new Date(iso);
  if (isNaN(nac.getTime())) return '';
  const hoy = new Date();
  let años = hoy.getFullYear() - nac.getFullYear();
  const cumpleEsteAño =
    hoy.getMonth() > nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate());
  if (!cumpleEsteAño) años -= 1;
  return años >= 14 && años <= 99 ? String(años) : '';
}

// ¿Esta pantalla queda contestada con lo que sabemos del perfil? Se decide por
// el contenido de la respuesta, no por la posición, para que siga valiendo si
// mañana se reordenan o se añaden pantallas.
function cubiertaPorPerfil(step, datos) {
  if (!step || !datos) return false;
  if (step.type === 'nombre') {
    return !!(datos.first_name?.trim() && datos.last_name?.trim());
  }
  if (step.key === 'edad') {
    const n = parseInt(datos.edad, 10);
    return !isNaN(n) && n >= 14 && n <= 99;
  }
  return false;
}

// Primera pantalla que sí hay que enseñar (la 0 es la intro).
function primeraPantallaPendiente(datos) {
  let i = 1;
  while (i < STEPS.length - 1 && cubiertaPorPerfil(STEPS[i], datos)) i += 1;
  return i;
}

export default function EmpiezaTuCambioPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({
    first_name: '', last_name: '', edad: '', region_vives: '', pais_vives: '',
    objetivo_principal: '', impide_lograr: [], intentos: '',
    prioridad_para_ti: '', empuja_a_cambiar: '', tiempo_y_esfuerzo: '',
    inversion: '', obstaculo_importante: '', coach_squat_fit: '',
    peso_altura: '', phone: '', instagram: '',
  });
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const { marcar: marcarGesto } = useMicroFeedback();
  // Frase de la pausa a pantalla completa entre una pregunta y la siguiente.
  const [pausa, setPausa] = useState(null);
  // Portada: nada se escribe hasta que el lead pulsa «Empezar». Ese clic es el
  // gesto que el navegador exige para dejar sonar el audio; sin él, el tecleo de
  // la primera pantalla se perdería en silencio.
  const [started, setStarted] = useState(false);
  // Fase intermedia: la portada apartándose. Sin esto el cambio sería un corte.
  const router = useRouter();
  const [saliendoPortada, setSaliendoPortada] = useState(false);
  // Salir: no se sale de golpe, primero se avisa de que queda guardado.
  const [pidiendoSalir, setPidiendoSalir] = useState(false);
  // Progreso encontrado en el navegador al abrir (null si no hay).
  const [guardado, setGuardado] = useState(null);
  // De qué enlace corto llegó (bio de Instagram, YouTube, email…).
  const [origenLead, setOrigenLead] = useState(null);
  // Modo landing sin salida (?directo=1): sin X en la cabecera.
  const [sinSalida, setSinSalida] = useState(false);
  const progresoLeido = useRef(false);
  // El contenido espera a que termine de escribirse el título.
  const [titleDone, setTitleDone] = useState(false);
  // Y el botón espera a que termine de escribirse TODO el texto de la pantalla.
  const [bodyDone, setBodyDone] = useState(false);
  // Pasos ya vistos: al volver atrás el texto sale de golpe (ya se leyó).
  const seenSteps = useRef(new Set());
  // Nombre y edad traídos de la cuenta, si el visitante llega con sesión.
  const token = useAuthStore((s) => s.token);
  const [delPerfil, setDelPerfil] = useState(null);
  const perfilPedido = useRef(false);

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
      case 'radio': {
        const elegido = answers[step.key];
        if (!elegido) return false;
        const hijo = step.hijos?.[elegido];
        return hijo ? !!answers[hijo.key] : true;
      }
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

  // Atribución: de qué enlace corto vino (ver form-links.mjs). Se lee una sola
  // vez al abrir, porque al retomar el formulario desde el botón flotante la URL
  // ya no lleva los parámetros y se perdería.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // `?directo=1`: landing sin salida, para los enlaces que manda el equipo
    // uno a uno por WhatsApp. Los enlaces de la bio, YouTube o los correos SÍ
    // llevan la X: ahí la persona ha llegado por su cuenta y encerrarla solo
    // consigue que se vaya por el botón de atrás, perdiendo lo respondido.
    if (p.get('directo') === '1') setSinSalida(true);
    const via = p.get('via');
    if (!via) return;
    setOrigenLead({
      via,
      utm_source: p.get('utm_source') || '',
      utm_medium: p.get('utm_medium') || '',
      utm_campaign: p.get('utm_campaign') || '',
      utm_content: p.get('utm_content') || '',
    });
  }, []);

  // Al abrir: ¿hay un formulario a medias guardado en este navegador?
  useEffect(() => {
    if (progresoLeido.current) return;
    progresoLeido.current = true;
    const p = leerProgreso(FORM_ID);
    if (p && p.indice > 0) setGuardado(p);
  }, []);

  // Si llega con sesión iniciada, traemos su nombre y su edad del perfil para no
  // volver a preguntárselos. Se pide mientras lee la portada, así que casi
  // siempre ha llegado antes de que pulse «Empezar»; si no llega a tiempo o el
  // token está caducado, el formulario arranca entero como siempre.
  useEffect(() => {
    // OJO: el token hay que leerlo suscribiéndose al store, no con getState() al
    // montar. La sesión se guarda en localStorage y zustand la rehidrata DESPUÉS
    // del primer render, así que un getState() de arranque la ve siempre vacía.
    if (perfilPedido.current || !token) return;
    perfilPedido.current = true;
    let vivo = true;
    fetch(USER_INFO_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((info) => {
        if (!vivo || !info) return;
        const datos = {
          first_name: (info.firstName || '').trim(),
          last_name: (info.lastName || '').trim(),
          edad: edadDesdeNacimiento(info.birth),
        };
        if (!datos.first_name && !datos.last_name && !datos.edad) return;
        setDelPerfil(datos);
        // Solo se rellena lo que esté en blanco: si ya escribió algo (o venía de
        // un progreso guardado), manda lo suyo.
        setAnswers((a) => ({
          ...a,
          first_name: a.first_name || datos.first_name,
          last_name: a.last_name || datos.last_name,
          edad: a.edad || datos.edad,
        }));
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [token]);

  // Guardar en cada respuesta y en cada cambio de pregunta. No sale de este
  // navegador: al servidor no se manda nada hasta que le da a enviar.
  useEffect(() => {
    if (!started || sent) return;
    guardarProgreso(FORM_ID, {
      respuestas: answers,
      indice: index,
      total,
      titulo: 'Aquí empieza tu cambio',
      url: FORM_URL,
      origen: origenLead,
    });
  }, [answers, index, started, sent, total, origenLead]);

  // Al salir de la intro, si el perfil ya contestó las primeras pantallas se
  // salta directo a la primera de verdad. El salto se hace SOLO aquí y una vez:
  // dentro del formulario se avanza siempre de una en una, para que nadie se
  // encuentre con dos pantallas pasando de golpe.
  const saltoDesdeIntro = delPerfil ? primeraPantallaPendiente(answers) : 1;

  const goNext = () => {
    if (!puedeAvanzar || index >= total - 1) return;
    playAdvance();
    if (index === 0 && saltoDesdeIntro > 1) {
      setTimeout(() => setIndex(saltoDesdeIntro), ADVANCE_DELAY);
      return;
    }
    // Cada 3-5 respuestas toca pausa a pantalla completa: tapa la pregunta
    // siguiente hasta que se va, para cortar la inercia de ir a toda prisa.
    const frase = step.type !== 'intro' ? marcarGesto() : null;
    if (frase) {
      setPausa(frase);
      setTimeout(() => { setPausa(null); setIndex((i) => i + 1); }, PAUSA_MS);
      return;
    }
    // Sin pausa, al menos un respiro: si la pregunta siguiente entra de golpe,
    // se atropella con el sonido de avance y da sensación de ir a empujones.
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
      origen: origenLead?.via
        ? `web ${origenLead.via}`
        : (typeof window !== 'undefined' ? `web ${window.location.pathname}` : 'web'),
      ...(origenLead || {}),
    };
    try {
      if (SUBMIT_ENDPOINT) {
        // Contrato de POST /forms/public-answer: metadatos arriba, el resto de
        // respuestas como pares {question, answer}. website = honeypot vacío.
        const META_KEYS = ['first_name', 'last_name', 'phone', 'timestamp', 'origen',
          'via', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
        const body = {
          form_id: PRELLAMADA_FORM_ID,
          name: [submission.first_name, submission.last_name].filter(Boolean).join(' '),
          phone: String(submission.phone || ''),
          answers: Object.entries(submission)
            .filter(([k]) => !META_KEYS.includes(k))
            .map(([question, answer]) => ({ question, answer })),
          // El back office pinta la etiqueta de origen contra un vocabulario
          // cerrado (web | ig | email | youtube | otro), así que aquí se manda
          // uno de ésos y el detalle fino («ig-bio-maria») viaja en `via`. Si se
          // mandara el detalle en `source`, el CRM enseñaría la etiqueta vacía.
          // OJO: TikTok no tiene hueco en ese vocabulario y cae en «otro» hasta
          // que se le añada uno en el dashboard.
          source: CRM_SOURCE[origenLead?.utm_source] || 'web',
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
      borrarProgreso(FORM_ID);
      setSent(true);
    } catch (e) {
      console.error('prellamada submit', e);
      // Aunque falle el POST, no perdemos la solicitud del cliente.
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        prev.push(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
        borrarProgreso(FORM_ID);
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

      // Flechas ↑/↓: mover el resaltado entre las opciones, como un menú.
      // No se tocan dentro de campos (ahí las flechas ya significan otra cosa)
      // ni en el <select> de país, que trae su propio recorrido por teclado.
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (e.isComposing || escribiendoEnCampo(e.target)) return;
        if (moverFocoOpciones(e.key === 'ArrowDown' ? 1 : -1)) {
          e.preventDefault();
          // Al mantener pulsada la flecha el foco sigue corriendo, pero el
          // sonido solo suena en la primera: repetido treinta veces por
          // segundo es un zumbido, no una respuesta.
          if (!e.repeat) playSelect();
        }
        return;
      }

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

      // Enter con el foco en una opción: si aún no está elegida la elige y no
      // avanza; si ya lo está, avanza. Resaltar con flechas → Enter elige →
      // Enter sigue.
      if (elegirOpcionEnfocada(t)) { e.preventDefault(); return; }

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
          <Link href="/" className="mt-5 text-[#8B87C9] hover:text-[#363C98] font-semibold transition-colors">
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
    const arrancar = (retomar) => {
      unlockAudio();
      playAdvance();
      if (retomar && guardado) {
        setAnswers((a) => ({ ...a, ...(guardado.respuestas || {}) }));
        setIndex(guardado.indice || 0);
        // La atribución de origen se recupera con el resto: al volver desde el
        // botón flotante la URL ya no trae los parámetros.
        if (guardado.origen && !origenLead) setOrigenLead(guardado.origen);
      }
      const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (sinMovimiento) { setStarted(true); return; }
      setSaliendoPortada(true);
      setTimeout(() => setStarted(true), PORTADA_OUT_MS);
    };
    return (
      <div className="min-h-[100svh] w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className={`max-w-lg flex flex-col items-center ${saliendoPortada ? 'sf-portada-out' : 'sf-screen-in'}`}>
          <LogoEspagueti tamano={120} saliendo={saliendoPortada} className="-mb-8" />
          <div className="sf-portada-texto flex flex-col items-center">
            <h1 className="font-extrabold mb-4" style={{ color: BLUE, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
              {guardado ? '¿Seguimos donde lo dejaste?' : 'Vamos a conocerte'}
            </h1>
            <p className="text-[#6B6BA8] text-lg leading-relaxed mb-9">
              {guardado
                ? `Tenías ${guardado.indice} respuestas guardadas en este navegador. Puedes continuar por donde ibas o empezar de nuevo.`
                : 'Son unas preguntas rápidas sobre ti y tu objetivo. Tómate tu tiempo: cuanto mejor te conozca, mejor podré ayudarte en la llamada.'}
              {!guardado && delPerfil && primeraPantallaPendiente(answers) > 1 && (
                <>
                  <br />
                  <span className="text-base text-[#8B87C9]">
                    {delPerfil.first_name
                      ? `Como ya has entrado con tu cuenta, ${delPerfil.first_name}, me salto lo que ya sé de ti.`
                      : 'Como ya has entrado con tu cuenta, me salto lo que ya sé de ti.'}
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => arrancar(!!guardado)}
              className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg cursor-pointer"
              style={{ backgroundColor: BLUE }}
            >
              {guardado ? 'Continuar' : 'Empezar'}
            </button>
            {guardado && (
              <button
                type="button"
                onClick={() => { borrarProgreso(FORM_ID); setGuardado(null); }}
                className="mt-4 text-[#8B87C9] hover:text-[#363C98] font-bold transition-colors cursor-pointer"
              >
                Empezar de nuevo
              </button>
            )}
          </div>
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
          {!sinSalida && <ExitButton onClick={() => setPidiendoSalir(true)} />}
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
                className="text-[#363C98] text-lg sm:text-2xl leading-relaxed mt-4"
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
              <div className="flex flex-col gap-3 max-w-md" data-opciones role="radiogroup" aria-label={step.title}>
                {step.options.map((opt, i) => {
                  const active = answers[step.key] === opt;
                  const hijo = step.hijos?.[opt];
                  return (
                    <React.Fragment key={opt}>
                      <button
                        type="button"
                        data-opcion
                        data-elegida={active ? 'true' : undefined}
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          // Al cambiar de opción se limpia la respuesta hija:
                          // si no, quedaría un país de Europa con Latam marcada.
                          const limpiar = {};
                          Object.values(step.hijos || {}).forEach((h) => { limpiar[h.key] = ''; });
                          choose({ ...limpiar, [step.key]: opt });
                        }}
                        className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                        style={active
                          ? { '--i': i, borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
                          : { '--i': i, borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE }}
                      >
                        {opt}
                      </button>
                      {hijo && active && (
                        <ChildField>
                          {/* <select> nativo a propósito: en móvil abre la rueda
                              del sistema y en escritorio ya trae el salto por
                              teclado (pulsar «M» lleva a México). */}
                          <select
                            autoFocus
                            value={answers[hijo.key] || ''}
                            onChange={(e) => choose({ [hijo.key]: e.target.value })}
                            className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg outline-none cursor-pointer bg-[#FFF9F5] appearance-none"
                            style={{ borderColor: '#FBD5B8', color: answers[hijo.key] ? ORANGE : '#F0A876' }}
                          >
                            <option value="" disabled>{hijo.etiqueta}</option>
                            {hijo.opciones.map((pais) => (
                              <option key={pais} value={pais} style={{ color: BLUE }}>{pais}</option>
                            ))}
                          </select>
                        </ChildField>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {step.type === 'checkbox' && (
              <div className="flex flex-col gap-3 max-w-md" data-opciones role="group" aria-label={step.title}>
                {step.options.map((opt, i) => {
                  const selected = (answers[step.key] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      data-opcion
                      data-elegida={selected ? 'true' : undefined}
                      aria-pressed={selected}
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
                <p className="text-[#363C98] text-lg sm:text-xl leading-relaxed mb-8">
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

      <PausaPantalla texto={pausa} />

      <SalidaDialogo
        abierto={pidiendoSalir}
        indice={index}
        total={total}
        onSeguir={() => setPidiendoSalir(false)}
        onSalir={() => router.push('/programa')}
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
