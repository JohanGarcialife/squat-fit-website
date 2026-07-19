'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import esPhone from 'react-phone-input-2/lang/es.json';
import { getData as getCountryData } from 'country-list';
import { useAuthStore } from '@/stores/auth.store';
import AccessNotice from '@/app/components/AccessNotice';
import GdprCheckbox from '@/app/components/GdprCheckbox';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';
const BLUE = '#3932C0';
const ORANGE = '#FF690B';

const esPhoneLocalization = { ...esPhone, gb: 'Inglaterra' };
const COUNTRY_OPTIONS = (() => {
  const raw = getCountryData().map((c) => ({ code: c.code, name: esPhone[c.code.toLowerCase()] || c.name }));
  raw.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const es = raw.find((c) => c.code === 'ES');
  return [es, ...raw.filter((c) => c.code !== 'ES')].filter(Boolean);
})();

// Fases mostradas en el panel derecho.
const PHASES = ['Datos básicos', 'Tu cuerpo', 'Estilo de vida', 'Último paso'];

// Actividad diaria en femenino + aclaración corta (el backend devuelve los
// nombres en masculino; los presentamos como "la actividad… sedentaria").
const ACTIVIDAD_LABELS = {
  'sedentario': ['Sedentaria', 'trabajo sentado y poco movimiento en el día'],
  'ligero': ['Ligera', 'caminas algo o estás de pie parte del día'],
  'moderado': ['Moderada', 'te mueves buena parte del día'],
  'activo': ['Activa', 'trabajo físico o mucho movimiento diario'],
  'muy activo': ['Muy activa', 'trabajo muy físico durante casi todo el día'],
};

// Definición de pantallas. Cada una mapea a datos reales del perfil.
const STEPS = [
  {
    phase: 0,
    type: 'intro',
    title: '¡Vamos a personalizar tu plan!',
    body: 'Rellena las preguntas para poder adaptar el proceso a ti.\n\nNo es un examen, así que responde con sinceridad.',
    readDelay: 3500,
  },
  { phase: 0, type: 'basicos', title: 'Datos básicos' },
  { phase: 1, type: 'sexo', title: 'Sexo', subtitle: 'Selecciona una opción' },
  { phase: 1, type: 'number', key: 'altura', title: '¿Cuánto mides?', subtitle: 'En centímetros', unit: 'cm', min: 100, max: 250 },
  { phase: 1, type: 'number', key: 'peso', title: '¿Cuánto pesas ahora?', subtitle: 'En kilos', unit: 'kg', min: 30, max: 350, decimal: true },
  { phase: 1, type: 'number', key: 'pesoObjetivo', title: '¿Cuál es tu peso objetivo?', subtitle: 'En kilos', unit: 'kg', min: 30, max: 350, decimal: true },
  { phase: 2, type: 'select', key: 'steps_peer_day_id', list: 'steps', title: '¿Cuántos pasos das al día?', subtitle: 'Aproximadamente' },
  { phase: 2, type: 'select', key: 'strength_training_id', list: 'strength', title: '¿Entrenas fuerza?', subtitle: 'Selecciona una opción' },
  { phase: 2, type: 'select', key: 'weekly_cardio_frequency_id', list: 'cardio', title: '¿Con qué frecuencia haces cardio?', subtitle: 'Selecciona una opción' },
  { phase: 2, type: 'select', key: 'daily_activity_id', list: 'activity', title: '¿Cómo es tu actividad diaria?', subtitle: 'Selecciona una opción' },
  { phase: 3, type: 'done', title: '¡Todo listo!', body: 'Hemos guardado tus respuestas. Ya podemos adaptar tu experiencia a ti.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({
    nombre: '', apellidos: '', paisIdioma: 'España', edad: '', email: '', telefono: '',
    sexo: '', altura: '', peso: '', pesoObjetivo: '',
    steps_peer_day_id: '', strength_training_id: '', weekly_cardio_frequency_id: '', daily_activity_id: '',
  });
  const [lists, setLists] = useState({ steps: [], strength: [], cardio: [], activity: [] });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [canAdvance, setCanAdvance] = useState(true); // para el retardo de lectura
  const [gdprAccepted, setGdprAccepted] = useState(false); // RGPD en el último paso
  const [dir, setDir] = useState(1); // dirección de la transición

  const step = STEPS[index];
  const total = STEPS.length;

  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));

  // Carga: exige sesión, precarga datos del perfil y las listas de estilo de vida.
  useEffect(() => {
    // Sin sesión no cargamos nada: el render muestra el aviso de acceso.
    if (!token) return;
    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const infoRes = await axios.get(`${API}/api/v1/user/info`, { headers });
        const info = infoRes.data;
        setUserId(info.id);

        let sexo = '';
        if (info.gender === 'male') sexo = 'Hombre';
        else if (info.gender === 'female') sexo = 'Mujer';
        let edad = '';
        if (info.birth) {
          const y = parseInt(String(info.birth).slice(0, 4), 10);
          if (!isNaN(y)) edad = String(Math.max(0, new Date().getFullYear() - y));
        }
        setAnswers((a) => ({
          ...a,
          nombre: info.firstName || '', apellidos: info.lastName || '',
          paisIdioma: info.country || 'España', email: info.email || '',
          telefono: info.phone_number || '', edad,
          sexo, altura: info.height || '', peso: info.weight || '', pesoObjetivo: info.target_weight || '',
          steps_peer_day_id: info.steps_peer_day_id || '', strength_training_id: info.strength_training_id || '',
          weekly_cardio_frequency_id: info.weekly_cardio_frequency_id || '', daily_activity_id: info.daily_activity_id || '',
        }));

        try {
          const [s, st, c, ac] = await Promise.all([
            axios.get(`${API}/api/v1/user/steps-peer-day`, { headers }),
            axios.get(`${API}/api/v1/user/strength-training`, { headers }),
            axios.get(`${API}/api/v1/user/weekly_cardio_frequency`, { headers }),
            axios.get(`${API}/api/v1/user/daily-activity`, { headers }),
          ]);
          setLists({ steps: s.data || [], strength: st.data || [], cardio: c.data || [], activity: ac.data || [] });
        } catch (e) { console.error('listas estilo de vida', e); }
      } catch (e) {
        console.error('onboarding load', e);
        toast.error('No pudimos cargar tus datos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Retardo de lectura en pantallas de solo texto (intro): "Continuar" espera.
  useEffect(() => {
    if (step?.readDelay) {
      setCanAdvance(false);
      const t = setTimeout(() => setCanAdvance(true), step.readDelay);
      return () => clearTimeout(t);
    }
    setCanAdvance(true);
  }, [index, step]);

  // ¿Se puede avanzar en la pantalla actual?
  const isValid = useMemo(() => {
    if (!step) return false;
    if (step.readDelay && !canAdvance) return false;
    switch (step.type) {
      case 'intro':
        return true;
      case 'done':
        return gdprAccepted;
      case 'basicos':
        return answers.nombre.trim().length > 0 && answers.paisIdioma;
      case 'sexo':
        return !!answers.sexo;
      case 'number': {
        const n = parseFloat(String(answers[step.key]).replace(',', '.'));
        return !isNaN(n) && n >= step.min && n <= step.max;
      }
      case 'select':
        return !!answers[step.key];
      default:
        return true;
    }
  }, [step, answers, canAdvance, gdprAccepted]);

  const goNext = async () => {
    if (!isValid) return;
    if (index < total - 1) {
      setDir(1);
      setIndex((i) => i + 1);
      return;
    }
  };

  const goBack = () => {
    if (index === 0) { setExitOpen(true); return; }
    setDir(-1);
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Si el id no llegó al cargar, lo reintentamos aquí: antes esto se
      // saltaba el guardado EN SILENCIO y redirigía (parecía que todo fue
      // bien sin guardar nada).
      let uid = userId;
      if (!uid) {
        const info = (await axios.get(`${API}/api/v1/user/info`, { headers: { Authorization: `Bearer ${token}` } })).data;
        uid = info?.id;
        if (uid) setUserId(uid);
      }
      if (!uid) throw new Error('No pudimos identificar tu usuario. Recarga e inténtalo de nuevo.');
      const apiGender = answers.sexo === 'Hombre' ? 'male' : answers.sexo === 'Mujer' ? 'female' : '';
      const birth = answers.edad ? `${new Date().getFullYear() - parseInt(answers.edad, 10)}-01-01` : '';
      const fd = new FormData();
      fd.append('firstName', answers.nombre || '');
      fd.append('lastName', answers.apellidos || '');
      if (birth) fd.append('birth', birth);
      fd.append('phone_number', answers.telefono || '');
      if (apiGender) fd.append('gender', apiGender);
      fd.append('country', answers.paisIdioma || '');
      const h = String(answers.altura).replace(/[^0-9]/g, '');
      const w = String(answers.peso).replace(/[^0-9.]/g, '');
      const tw = String(answers.pesoObjetivo).replace(/[^0-9.]/g, '');
      if (h) fd.append('height', h);
      if (w) fd.append('weight', w);
      if (tw) fd.append('target_weight', tw);
      ['steps_peer_day_id', 'strength_training_id', 'weekly_cardio_frequency_id', 'daily_activity_id'].forEach((k) => {
        if (answers[k]) fd.append(k, answers[k]);
      });
      await axios.put(`${API}/api/v1/user/update?user_id=${uid}`, fd, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('¡Perfil completado!');
      router.push('/panel-control');
    } catch (e) {
      console.error('guardar onboarding', e);
      const detail = e?.response?.data?.message;
      // NOS QUEDAMOS en la página (antes redirigía igualmente y el error se
      // perdía): el usuario ve el fallo y puede reintentar con el mismo botón.
      toast.error(typeof detail === 'string' && detail
        ? `No pudimos guardar: ${detail}`
        : 'No pudimos guardar tus respuestas. Revisa tu conexión y pulsa de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!token) return <AccessNotice redirect="/onboarding" />;
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: ORANGE }} />
        <span className="text-slate-500 font-bold text-sm mt-4">Preparando tus preguntas…</span>
      </div>
    );
  }

  const progress = Math.round(((index + (step.type === 'done' ? 1 : 0)) / (total - 1)) * 100);

  return (
    <div className="min-h-screen w-full flex">
      {/* ===== IZQUIERDA: pregunta activa ===== */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-8 relative">
        {/* Barra de progreso + cerrar */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16">
          <div className="flex-1 h-2.5 rounded-full bg-[#DEDCF5] overflow-hidden">
            <div className="h-full rounded-full sf-progress-fill" style={{ width: `${progress}%`, backgroundColor: BLUE }} />
          </div>
          <button onClick={() => setExitOpen(true)} aria-label="Salir" className="text-[#8B87C9] hover:text-[#3932C0] transition-colors cursor-pointer text-xl font-bold px-1">
            ✕
          </button>
        </div>

        {/* Contenido (con animación de entrada) */}
        <div key={index} className="flex-1 flex flex-col max-w-xl w-full mx-auto sf-screen-in">
          {/* Título contenido: antes crecía hasta 3.25rem y a dos líneas se
              comía media pantalla en desktop (captura del 18 jul). */}
          <h1 className="font-extrabold leading-tight mb-3" style={{ color: BLUE, fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)' }}>
            {step.title}
          </h1>
          {step.subtitle && <p className="text-[#6B6BA8] text-base sm:text-lg mb-7">{step.subtitle}</p>}

          <div className="flex-1">
            {step.type === 'intro' && (
              <p className="text-[#3932C0] text-lg sm:text-2xl leading-relaxed whitespace-pre-line mt-4">{step.body}</p>
            )}

            {step.type === 'basicos' && (
              <div className="flex flex-col gap-4 max-w-md">
                <FieldInput placeholder="Tu nombre" value={answers.nombre} onChange={(v) => set({ nombre: v })} autoFocus />
                <FieldInput placeholder="Tus apellidos" value={answers.apellidos} onChange={(v) => set({ apellidos: v })} />
                <select
                  value={answers.paisIdioma}
                  onChange={(e) => set({ paisIdioma: e.target.value })}
                  className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] cursor-pointer"
                  style={{ borderColor: '#FBD5B8', color: ORANGE }}
                >
                  {COUNTRY_OPTIONS.map((c) => (<option key={c.code} value={c.name}>{c.name}</option>))}
                </select>
                <FieldInput placeholder="Tu edad" value={answers.edad} onChange={(v) => set({ edad: v.replace(/[^0-9]/g, '').slice(0, 3) })} inputMode="numeric" />
                <div className="onb-phone">
                  <PhoneInput
                    country={'es'}
                    preferredCountries={['es', 'pt', 'gb', 'fr', 'mx', 'ar', 'co', 'cl']}
                    localization={esPhoneLocalization}
                    value={answers.telefono}
                    onChange={(phone) => set({ telefono: phone })}
                    inputClass="!w-full !rounded-2xl !border-2 !pl-14 !pr-4 !py-3.5 !h-auto !text-[#FF690B] !font-bold !bg-[#FFF9F5]"
                    containerClass="!w-full"
                    buttonClass="!bg-transparent !border-0 !rounded-l-2xl !pl-3"
                  />
                </div>
                {answers.email && (
                  <p className="text-slate-400 text-sm pl-2">Cuenta: <span className="font-semibold text-slate-500">{answers.email}</span></p>
                )}
              </div>
            )}

            {step.type === 'sexo' && (
              <div className="flex flex-col gap-4 max-w-md">
                {/* Iconos PNG del diseño de Figma (carpeta Formularios/PNGs) */}
                {[
                  { v: 'Hombre', img: '/onboarding/hombre.png' },
                  { v: 'Mujer', img: '/onboarding/mujer.png' },
                ].map((o, i) => {
                  const active = answers.sexo === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => set({ sexo: o.v })}
                      className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-3.5 font-bold text-base sm:text-lg cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                      style={active
                        ? { '--i': i, borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
                        : { '--i': i, borderColor: '#FBD5B8', backgroundColor: '#FFF9F5', color: ORANGE }}
                    >
                      <Image src={o.img} width={44} height={44} alt="" className="rounded-full" />
                      {o.v}
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === 'number' && (
              <div className="max-w-xs">
                <div className="flex items-baseline gap-3 border-b-2 pb-2" style={{ borderColor: ORANGE }}>
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={answers[step.key]}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.,]/g, '');
                      set({ [step.key]: step.decimal ? raw : raw.replace(/[.,]/g, '') });
                    }}
                    placeholder="0"
                    className="w-full bg-transparent font-extrabold outline-none placeholder:text-slate-300"
                    style={{ color: BLUE, fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                  />
                  <span className="text-2xl font-bold shrink-0" style={{ color: '#8B87C9' }}>{step.unit}</span>
                </div>
              </div>
            )}

            {step.type === 'select' && (
              <div className="flex flex-col gap-3 max-w-md">
                {(lists[step.list] || []).map((opt, i) => {
                  const active = answers[step.key] === opt.id;
                  // La actividad diaria va en FEMENINO (es "la actividad") y
                  // con una aclaración pequeña de a qué se refiere cada nivel.
                  const extra = step.key === 'daily_activity_id' ? ACTIVIDAD_LABELS[String(opt.name || '').trim().toLowerCase()] : null;
                  const label = extra ? extra[0] : opt.name;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set({ [step.key]: opt.id })}
                      className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-base sm:text-[17px] cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                      style={active
                        ? { '--i': i, borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
                        : { '--i': i, borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE }}
                    >
                      {label}
                      {extra && (
                        <span className="block text-xs font-medium opacity-70 mt-0.5">({extra[1]})</span>
                      )}
                    </button>
                  );
                })}
                {(!lists[step.list] || lists[step.list].length === 0) && (
                  <p className="text-slate-400">No hay opciones disponibles ahora mismo. Puedes continuar.</p>
                )}
              </div>
            )}

            {step.type === 'done' && (
              <div className="mt-2">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-[#3932C0] text-lg sm:text-2xl leading-relaxed whitespace-pre-line">{step.body}</p>
                <GdprCheckbox checked={gdprAccepted} onChange={setGdprAccepted} id="gdpr-onboarding" className="mt-8" />
              </div>
            )}
          </div>
        </div>

        {/* Pie: Continuar + Atrás + contador */}
        <div className="max-w-xl w-full mx-auto mt-8">
          <button
            onClick={step.type === 'done' ? handleFinish : goNext}
            disabled={!isValid || saving}
            className={`w-full rounded-2xl py-4 font-bold text-white text-lg cursor-pointer disabled:cursor-not-allowed sf-cta ${isValid && !saving ? 'is-enabled' : ''}`}
            style={{ backgroundColor: isValid && !saving ? BLUE : '#C6C3E8' }}
          >
            {saving ? 'Guardando…' : step.type === 'done' ? 'Ir a mi panel' : 'Continuar'}
          </button>
          <div className="flex items-center justify-between mt-4">
            <button onClick={goBack} className="text-[#8B87C9] hover:text-[#3932C0] font-semibold transition-colors cursor-pointer flex items-center gap-1">
              ‹ Atrás
            </button>
            <span className="text-[#B4B1D6] font-semibold text-sm">{index + 1}/{total}</span>
          </div>
        </div>
      </div>

      {/* ===== DERECHA: logo + fases (solo en pantallas anchas) ===== */}
      <aside className="hidden lg:flex w-[38%] max-w-lg flex-col items-center bg-[#F3F2F9] px-10 py-12">
        <Image src="/LogotipoSquatfit.png" width={96} height={96} alt="Squad Fit" className="mb-14" />
        <p className="text-[#8B87C9] font-bold mb-8">Personaliza tu plan</p>
        <div className="flex flex-col gap-5 items-center">
          {PHASES.map((p, i) => {
            const active = step.phase === i;
            return (
              <span key={p} className={`text-lg transition-colors ${active ? 'font-extrabold' : ''}`} style={{ color: active ? BLUE : '#A9A6CE' }}>
                {p}
              </span>
            );
          })}
        </div>
      </aside>

      {/* ===== Modal salir ===== */}
      {exitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setExitOpen(false)}>
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-extrabold text-[#363C98] mb-2">¿Seguro que quieres salir?</h3>
            <p className="text-slate-500 mb-6">Podrás completar tu perfil más tarde desde tu panel.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setExitOpen(false)} className="w-full rounded-2xl py-3 font-bold text-white cursor-pointer" style={{ backgroundColor: BLUE }}>
                Seguir aquí
              </button>
              <button onClick={() => router.push('/panel-control')} className="w-full rounded-2xl py-3 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                Salir de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .onb-phone .react-tel-input .form-control { height: auto; }
      `}</style>
    </div>
  );
}

// Input de texto con el estilo naranja del formulario.
function FieldInput({ value, onChange, placeholder, inputMode, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876]"
      style={{ borderColor: '#FBD5B8', color: ORANGE }}
    />
  );
}
