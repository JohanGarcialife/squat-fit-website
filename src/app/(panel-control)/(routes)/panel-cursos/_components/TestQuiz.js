'use client';

import React, { useState } from 'react';
import axios from 'axios';

// Quiz de curso (R1-F6): modal para hacer el test de una clase, de un módulo o
// el final. Las preguntas llegan SIN solución (GET course/tests); la corrección
// la devuelve el servidor al entregar (POST course/tests/submit) con la
// respuesta correcta y la explicación por pregunta. Repetible.
const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

export default function TestQuiz({ test, token, onClose }) {
  const questions = (test?.questions || []).slice().sort(
    (a, b) => (a.question_priority ?? 0) - (b.question_priority ?? 0),
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // question_id -> answer_id
  const [phase, setPhase] = useState('quiz'); // quiz | sending | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  if (!test || questions.length === 0) return null;
  const q = questions[Math.min(step, questions.length - 1)];
  const answered = Object.keys(answers).length;

  const choose = (answerId) => {
    setAnswers((prev) => ({ ...prev, [q.id]: answerId }));
    if (step < questions.length - 1) setStep(step + 1);
  };

  const submit = async () => {
    setPhase('sending');
    setError(false);
    try {
      const body = {
        answers: questions.map((qq) => ({ question_id: qq.id, answer_id: answers[qq.id] ?? null })),
      };
      const res = await axios.post(
        `${API}/api/v1/course/tests/submit`,
        body,
        { headers: { Authorization: `Bearer ${token}` }, params: { test_id: test.id } },
      );
      setResult(res.data);
      setPhase('result');
    } catch (e) {
      console.error('submit test', e?.response?.data || e.message);
      setError(true);
      setPhase('quiz');
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
    setPhase('quiz');
  };

  const answerTextById = (qq, id) =>
    (qq.answers || []).find((a) => a.id === id)?.answer ?? '—';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-3 py-6" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 py-4 rounded-t-[24px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF690B]">
              {test.kind === 'module' ? 'Test del módulo' : test.kind === 'final' ? 'Test final del curso' : 'Test de la clase'}
            </p>
            <h3 className="text-[#363C98] font-extrabold text-lg leading-tight">{test.title || 'Test'}</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="shrink-0 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {phase !== 'result' && (
          <div className="px-6 py-5">
            {/* Progreso */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#FF690B] transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-[#363C98]/60">{step + 1}/{questions.length}</span>
            </div>

            <p className="mb-4 text-[#363C98] font-bold text-base sm:text-lg leading-snug">{q.question}</p>
            <div className="flex flex-col gap-2.5">
              {(q.answers || [])
                .slice()
                .sort((a, b) => (a.answer_priority ?? 0) - (b.answer_priority ?? 0))
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => choose(a.id)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left text-sm sm:text-base font-medium transition-colors cursor-pointer ${
                      answers[q.id] === a.id
                        ? 'border-[#FF690B] bg-[#FFF6F0] text-[#363C98]'
                        : 'border-slate-200 text-slate-700 hover:border-[#FF690B]/50'
                    }`}
                  >
                    {a.answer}
                  </button>
                ))}
            </div>

            {/* Navegación */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="rounded-xl px-4 py-2 text-sm font-bold text-[#363C98]/70 disabled:opacity-30 cursor-pointer"
              >
                ← Anterior
              </button>
              {answered === questions.length ? (
                <button
                  onClick={submit}
                  disabled={phase === 'sending'}
                  className="rounded-2xl bg-[#FF690B] px-6 py-3 text-sm sm:text-base font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-60 cursor-pointer"
                >
                  {phase === 'sending' ? 'Corrigiendo…' : 'Entregar y corregir'}
                </button>
              ) : (
                <button
                  onClick={() => setStep(Math.min(questions.length - 1, step + 1))}
                  disabled={step >= questions.length - 1}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-[#363C98]/70 disabled:opacity-30 cursor-pointer"
                >
                  Siguiente →
                </button>
              )}
            </div>
            {error && (
              <p className="mt-3 text-sm font-semibold text-red-500">No se pudo entregar el test. Comprueba tu conexión e inténtalo de nuevo.</p>
            )}
          </div>
        )}

        {phase === 'result' && result && (
          <div className="px-6 py-6">
            <div className="mb-6 flex flex-col items-center text-center">
              <p className="text-5xl font-extrabold text-[#363C98]">
                {result.score}<span className="text-2xl text-[#363C98]/50">/{result.total}</span>
              </p>
              <p className="mt-1 font-semibold text-[#6B6BA8]">
                {result.score === result.total
                  ? '¡Perfecto! Lo tienes dominado 💪'
                  : result.score >= Math.ceil(result.total * 0.6)
                    ? '¡Buen trabajo! Repasa los fallos y a por todas.'
                    : 'Repasa la clase y vuelve a intentarlo: así se aprende.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {questions.map((qq) => {
                const r = (result.results || []).find((x) => x.question_id === qq.id);
                if (!r) return null;
                return (
                  <div key={qq.id} className={`rounded-2xl border-2 p-4 ${r.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <p className="mb-1.5 font-bold text-[#363C98] text-sm sm:text-base">{qq.question}</p>
                    <p className={`text-sm font-semibold ${r.correct ? 'text-green-700' : 'text-red-600'}`}>
                      {r.correct ? '✔ Correcta: ' : '✘ Tu respuesta: '}{answerTextById(qq, r.answer_id)}
                    </p>
                    {!r.correct && (
                      <p className="text-sm font-semibold text-green-700">✔ Correcta: {answerTextById(qq, r.correct_answer_id)}</p>
                    )}
                    {r.explanation && (
                      <p className="mt-1.5 text-sm text-slate-600 leading-snug">{r.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={reset} className="rounded-2xl border-2 border-[#FF690B] px-5 py-2.5 font-bold text-[#FF690B] hover:bg-[#FFF6F0] cursor-pointer">
                Repetir test
              </button>
              <button onClick={onClose} className="rounded-2xl bg-[#363C98] px-6 py-3 font-bold text-white cursor-pointer">
                Seguir con el curso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
