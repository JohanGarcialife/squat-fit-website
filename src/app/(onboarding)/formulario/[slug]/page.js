'use client';

// Formularios del dashboard (14.1–14.3): /formulario/evaluacion-inicial,
// /formulario/seguimiento-semanal y /formulario/revision-mensual.
// Exigen sesión (son formularios de cliente del programa) y usan el motor
// FormRunner (mismo motor visual del onboarding + movimiento CSS).

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import AccessNotice from '@/app/components/AccessNotice';
import FormRunner from '@/app/components/FormRunner';
import { FORM_DEFINITIONS, computeWeeklyScores, isoWeekId } from '@/app/components/formDefinitions';

const API = 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

// Guardado en el backend (conectado 20-jul-2026, lote 4): las respuestas van a
// POST /api/v1/forms/public-answer con los form_ids estables sembrados por la
// migración del backend. El endpoint enlaza la respuesta al usuario por email.
// El SEGUIMIENTO SEMANAL es distinto: va al motor de hábitos
// (POST /api/v1/habits/weekly-form) y no necesita form_id.
const BACKEND_FORM_IDS = {
  'evaluacion-inicial': 'f0a11e00-0000-4000-a000-000000000002',
  'seguimiento-semanal': 'f0a11e00-0000-4000-a000-000000000003',
  'revision-mensual': 'f0a11e00-0000-4000-a000-000000000004',
};

// Las 10 claves del DTO del motor (habit_engine_config.json). Las escalas del
// FormRunner ya guardan el valor numérico 1–5 en estas mismas claves.
const WEEKLY_KEYS = [
  'weekly_training_adherence', 'weekly_menu_adherence', 'weekly_hunger',
  'weekly_hydration_urine_color', 'weekly_sleep_hours', 'weekly_sleep_quality',
  'weekly_energy', 'weekly_stress', 'weekly_steps_level',
];

const SEMAPHORE_UI = {
  green: { emoji: '🟢', color: '#22C55E', bg: '#F0FDF4', fallback: 'Semana en verde' },
  yellow: { emoji: '🟡', color: '#EAB308', bg: '#FEFCE8', fallback: 'Semana en amarillo' },
  orange: { emoji: '🟠', color: '#F97316', bg: '#FFF7ED', fallback: 'Semana en naranja' },
  red: { emoji: '🔴', color: '#EF4444', bg: '#FEF2F2', fallback: 'Semana en rojo' },
};

// Pantalla final del Seguimiento semanal: semáforo + sugerencias + week_id del
// motor de hábitos, con enlace a la sección de Alertas del panel.
function WeeklyResultScreen({ result }) {
  const engine = result?.engine;

  if (!engine) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className="sf-screen-in max-w-lg flex flex-col items-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="font-extrabold mb-4 text-[#3932C0]" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
            Respuestas guardadas
          </h1>
          <p className="text-[#6B6BA8] text-lg leading-relaxed mb-8">
            No hemos podido conectar ahora mismo con el motor de hábitos, pero tus
            respuestas han quedado guardadas en este dispositivo. Vuelve a enviarlas
            más tarde o avisa a tu coach.
          </p>
          <Link
            href="/panel-planes"
            className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg text-center cursor-pointer"
            style={{ backgroundColor: '#FF690B' }}
          >
            Volver a mi panel
          </Link>
        </div>
      </div>
    );
  }

  const ui = SEMAPHORE_UI[engine.semaphore] || SEMAPHORE_UI.yellow;
  const actions = engine.suggested_actions || [];
  const decisions = (engine.decisions || []).filter((d) => d.message);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="sf-screen-in max-w-lg w-full flex flex-col items-center text-center">
        <div className="text-6xl mb-4">{ui.emoji}</div>
        <h1 className="font-extrabold mb-2 text-[#3932C0]" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
          {engine.semaphore_label || ui.fallback}
        </h1>
        <p className="text-[#8B87C9] font-semibold mb-6">
          Semana {engine.week_id}
          {engine.scores?.total != null && <> · puntuación global {Number(engine.scores.total).toFixed(1)}/5</>}
        </p>

        <div className="w-full rounded-3xl p-5 mb-6 text-left" style={{ backgroundColor: ui.bg }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Adherencia', engine.scores?.adherence],
              ['Recuperación', engine.scores?.recovery],
              ['Estrés', engine.scores?.stress],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold" style={{ color: ui.color }}>
                  {val != null ? Number(val).toFixed(1) : '—'}
                </p>
                <p className="text-xs font-bold text-[#363C98]/70 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="w-full text-left mb-6">
            <p className="text-[#363C98] font-extrabold mb-3">Sugerencias para esta semana</p>
            <ul className="space-y-2">
              {actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[#363C98]/85 leading-snug">
                  <span className="text-[#FF690B] font-bold mt-0.5">→</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {decisions.length > 0 && (
          <div className="w-full text-left mb-6">
            <p className="text-[#363C98] font-extrabold mb-3">Tus hábitos</p>
            <ul className="space-y-2">
              {decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[#363C98]/85 leading-snug">
                  <span className="mt-0.5">✅</span>
                  <span>{d.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/panel-alertas"
          className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg text-center cursor-pointer"
          style={{ backgroundColor: '#FF690B' }}
        >
          Ver mis alertas y hábitos
        </Link>
        <Link href="/panel-planes" className="mt-4 text-[#8B87C9] hover:text-[#3932C0] font-semibold transition-colors">
          Volver a mi panel
        </Link>
      </div>
    </div>
  );
}

export default function FormularioPage() {
  const { slug } = useParams();
  const { token } = useAuthStore();
  const [gender, setGender] = useState(null);

  const definition = FORM_DEFINITIONS[slug];

  // El sexo decide si se muestra el bloque "Para mujeres" (Evaluación inicial).
  useEffect(() => {
    if (!token || slug !== 'evaluacion-inicial') return;
    axios.get(`${API}/api/v1/user/info`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setGender(r.data?.gender || null))
      .catch(() => setGender(null));
  }, [token, slug]);

  if (!definition) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-2xl font-extrabold text-[#363C98]">Formulario no encontrado</h1>
        <Link href="/panel-planes" className="text-[#FF690B] font-bold hover:underline">Volver a mi programa</Link>
      </div>
    );
  }

  if (!token) return <AccessNotice redirect={`/formulario/${slug}`} />;

  const saveLocalCopy = (submission) => {
    const key = `sqf-form-${slug}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(submission);
    localStorage.setItem(key, JSON.stringify(prev));
  };

  const handleSubmit = async (answers) => {
    // ── Seguimiento semanal → motor de hábitos (9.6) ──────────────────────
    if (slug === 'seguimiento-semanal') {
      const week_id = isoWeekId();
      const body = { week_id };
      WEEKLY_KEYS.forEach((k) => { body[k] = answers[k]; });
      const weight = parseFloat(String(answers.weekly_weight_kg || '').replace(',', '.'));
      if (!isNaN(weight) && weight > 0) body.weekly_weight_kg = weight;

      let engine = null;
      try {
        const res = await axios.post(`${API}/api/v1/habits/weekly-form`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        engine = res.data || null;
      } catch (e) {
        console.error('weekly-form submit', e?.response?.data || e.message);
      }

      // Copia local siempre (respuestas + scores del cliente + lo que dijo el
      // motor), para no perder nada aunque falle la red.
      saveLocalCopy({
        answers,
        week_id,
        scores: computeWeeklyScores(answers),
        engine_result: engine,
        submitted_at: new Date().toISOString(),
      });
      return { engine };
    }

    // ── Evaluación inicial / Revisión mensual → forms públicos (lote 4) ───
    // El endpoint enlaza al usuario por email, así que lo pedimos al perfil.
    const submission = { answers, submitted_at: new Date().toISOString() };
    const formId = BACKEND_FORM_IDS[slug];
    if (formId) {
      let profile = null;
      try {
        const r = await axios.get(`${API}/api/v1/user/info`, { headers: { Authorization: `Bearer ${token}` } });
        profile = r.data || null;
      } catch { /* sin perfil seguimos: la respuesta queda sin enlazar */ }
      try {
        await axios.post(`${API}/api/v1/forms/public-answer`, {
          form_id: formId,
          email: profile?.email || undefined,
          name: [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || undefined,
          answers: Object.entries(answers).map(([question, answer]) => ({ question, answer })),
          source: `/formulario/${slug}`,
          website: '',
        });
      } catch (e) {
        console.error('public-answer submit', e?.response?.data || e.message);
      }
    }
    saveLocalCopy(submission);
  };

  return (
    <FormRunner
      definition={definition}
      context={{ gender }}
      onSubmit={handleSubmit}
      exitHref="/panel-planes"
      renderResult={slug === 'seguimiento-semanal' ? (result) => <WeeklyResultScreen result={result} /> : undefined}
    />
  );
}
