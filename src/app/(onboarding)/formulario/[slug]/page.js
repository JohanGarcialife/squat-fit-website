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

// Guardado en el backend: el módulo de forms existente
// (POST /api/v1/advice/create-answer-form, body {form_id, answers[]}) necesita
// el form_id del formulario creado en el back office. Cuando lo tengáis,
// mapead aquí slug → form_id y el POST ya está preparado; mientras tanto las
// respuestas quedan en localStorage (clave sqf-form-<slug>).
const BACKEND_FORM_IDS = {
  // 'evaluacion-inicial': '<form_id>',
  // 'seguimiento-semanal': '<form_id>',
  // 'revision-mensual': '<form_id>',
};

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

  const handleSubmit = async (answers) => {
    const weekly = slug === 'seguimiento-semanal';
    const submission = {
      answers,
      ...(weekly ? { week_id: isoWeekId(), scores: computeWeeklyScores(answers) } : {}),
      submitted_at: new Date().toISOString(),
    };

    const formId = BACKEND_FORM_IDS[slug];
    if (formId) {
      await axios.post(
        `${API}/api/v1/advice/create-answer-form`,
        {
          form_id: formId,
          answers: Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    // Copia local siempre (y único guardado mientras no haya form_id).
    const key = `sqf-form-${slug}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(submission);
    localStorage.setItem(key, JSON.stringify(prev));
  };

  return (
    <FormRunner
      definition={definition}
      context={{ gender }}
      onSubmit={handleSubmit}
      exitHref="/panel-planes"
    />
  );
}
