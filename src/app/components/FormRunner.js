'use client';

// Motor genérico de formularios "tipo Duolingo" (una pregunta por pantalla),
// el mismo motor visual del onboarding + movimiento CSS del briefing (sf-*).
// Se usa para los formularios del dashboard (Evaluación inicial, Seguimiento
// semanal, Revisión mensual) y sirve para cualquier form futuro.
//
// Tipos de pregunta soportados (respetan el tipo indicado en cada docx):
//  - intro      pantalla de texto
//  - radio      opción única (con `allowOther` para "Otro: ___")
//  - scale      opción única 1–5 (guarda valor numérico + etiqueta)
//  - checkbox   varias casillas
//  - text       respuesta corta / `long: true` para párrafo
//  - number     numérica con unidad
//  - multitext  lista de textos libres (con casilla "no consumo nada")
//  - mealtext   párrafo con casilla "no consumo nada aquí" (recuerdo 24 h)
//  - consent    casilla obligatoria de consentimiento
//
// Cada pregunta puede llevar `showIf(answers, ctx)` para condicionales
// (p. ej. "solo mujeres", "solo si respondió Sí").

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BLUE = '#3932C0';
const ORANGE = '#FF690B';

const OTHER_PREFIX = 'Otro: ';

// `renderResult` (opcional): recibe lo que devuelva onSubmit y sustituye a la
// pantalla final genérica — lo usa el Seguimiento semanal para pintar el
// semáforo y las sugerencias del motor de hábitos.
export default function FormRunner({ definition, context = {}, onSubmit, exitHref = '/panel-control', renderResult }) {
  const { title: formTitle, phases = [], steps: allSteps } = definition;

  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null);
  const [otherDraft, setOtherDraft] = useState('');

  // Pasos visibles según condicionales (se recalcula con cada respuesta).
  const steps = useMemo(
    () => allSteps.filter((s) => !s.showIf || s.showIf(answers, context)),
    [allSteps, answers, context]
  );
  const step = steps[Math.min(index, steps.length - 1)];
  const total = steps.length;

  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));

  const isValid = useMemo(() => {
    if (!step) return false;
    const v = answers[step.key];
    switch (step.type) {
      case 'intro':
        return true;
      case 'radio':
      case 'scale':
        return v !== undefined && v !== '' && v !== null;
      case 'checkbox':
        return step.optional || (v || []).length > 0;
      case 'text':
        return step.optional || String(v || '').trim().length > 0;
      case 'number': {
        if (step.optional && String(v || '').trim() === '') return true;
        const n = parseFloat(String(v || '').replace(',', '.'));
        if (isNaN(n)) return false;
        if (step.min !== undefined && n < step.min) return false;
        if (step.max !== undefined && n > step.max) return false;
        return true;
      }
      case 'multitext':
        return answers[`${step.key}_none`] || (v || []).some((t) => String(t).trim().length > 0);
      case 'mealtext':
        return answers[`${step.key}_none`] || String(v || '').trim().length > 0;
      case 'consent':
        return !!v;
      default:
        return true;
    }
  }, [step, answers]);

  const goNext = () => {
    if (!isValid) return;
    setOtherDraft('');
    if (index < total - 1) setIndex((i) => i + 1);
  };
  const goBack = () => { setOtherDraft(''); setIndex((i) => Math.max(0, i - 1)); };

  const handleFinish = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const res = await onSubmit(answers);
      setResult(res ?? null);
      setSent(true);
    } catch (e) {
      console.error('form submit', e);
    } finally {
      setSaving(false);
    }
  };

  const progress = total > 1 ? Math.round((index / (total - 1)) * 100) : 0;
  const isLast = index === total - 1;

  if (sent && renderResult) {
    return renderResult(result);
  }

  if (sent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className="sf-screen-in max-w-lg flex flex-col items-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-extrabold mb-4" style={{ color: BLUE, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
            ¡Formulario enviado!
          </h1>
          <p className="text-[#6B6BA8] text-lg leading-relaxed mb-8">
            Hemos guardado tus respuestas de «{formTitle}». Tu coach las tendrá
            en cuenta para ajustar tu plan.
          </p>
          <Link
            href={exitHref}
            className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg text-center cursor-pointer"
            style={{ backgroundColor: ORANGE }}
          >
            Volver a mi panel
          </Link>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const choiceStyle = (active) => (active
    ? { borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
    : { borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE });

  const isOtherSelected = typeof answers[step.key] === 'string' && answers[step.key].startsWith(OTHER_PREFIX);

  return (
    <div className="min-h-screen w-full flex">
      {/* ===== IZQUIERDA: pregunta activa ===== */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 py-8 relative">
        <div className="flex items-center gap-4 mb-10 sm:mb-14">
          <div className="flex-1 h-2.5 rounded-full bg-[#DEDCF5] overflow-hidden">
            <div className="h-full rounded-full sf-progress-fill" style={{ width: `${progress}%`, backgroundColor: BLUE }} />
          </div>
          <Link href={exitHref} aria-label="Salir" className="text-[#8B87C9] hover:text-[#3932C0] transition-colors cursor-pointer text-xl font-bold px-1">
            ✕
          </Link>
        </div>

        <div key={`${step.key || step.type}-${index}`} className="flex-1 flex flex-col max-w-xl w-full mx-auto sf-screen-in">
          {step.phase && <p className="text-[#FF690B] font-bold text-sm uppercase tracking-wider mb-2">{step.phase}</p>}
          <h1 className="font-extrabold leading-tight mb-3" style={{ color: BLUE, fontSize: 'clamp(1.6rem, 2.6vw, 2.3rem)' }}>
            {step.title}
          </h1>
          {step.subtitle && <p className="text-[#6B6BA8] text-base sm:text-lg mb-6">{step.subtitle}</p>}

          <div className="flex-1">
            {step.type === 'intro' && (
              <p className="text-[#3932C0] text-lg sm:text-2xl leading-relaxed whitespace-pre-line mt-4">{step.body}</p>
            )}

            {(step.type === 'radio' || step.type === 'scale') && (
              <div className="flex flex-col gap-3 max-w-md">
                {step.options.map((opt, i) => {
                  const label = typeof opt === 'object' ? opt.label : opt;
                  const value = step.type === 'scale' ? (typeof opt === 'object' ? opt.value : i + 1) : label;
                  const active = answers[step.key] === value;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const patch = { [step.key]: value };
                        if (step.type === 'scale') patch[`${step.key}_label`] = label;
                        set(patch);
                      }}
                      className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-base sm:text-[17px] cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                      style={{ '--i': i, ...choiceStyle(active) }}
                    >
                      {label}
                    </button>
                  );
                })}
                {step.allowOther && (
                  <div
                    className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-base cursor-pointer sf-choice ${isOtherSelected ? 'is-selected' : ''}`}
                    style={{ '--i': step.options.length, ...choiceStyle(isOtherSelected) }}
                    onClick={() => { if (!isOtherSelected) set({ [step.key]: OTHER_PREFIX }); }}
                  >
                    Otro:
                    {isOtherSelected && (
                      <input
                        autoFocus
                        value={otherDraft || answers[step.key].slice(OTHER_PREFIX.length)}
                        onChange={(e) => { setOtherDraft(e.target.value); set({ [step.key]: OTHER_PREFIX + e.target.value }); }}
                        placeholder="escríbelo aquí"
                        className="ml-2 bg-transparent outline-none font-semibold w-2/3"
                        style={{ color: ORANGE }}
                      />
                    )}
                  </div>
                )}
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
                      className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 font-bold text-base cursor-pointer text-left sf-choice sf-stagger ${selected ? 'is-selected' : ''}`}
                      style={{ '--i': i, ...choiceStyle(selected) }}
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
                    value={answers[step.key] || ''}
                    onChange={(e) => set({ [step.key]: e.target.value })}
                    placeholder={step.placeholder || 'Tu respuesta…'}
                    className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none"
                    style={{ borderColor: '#FBD5B8', color: ORANGE }}
                  />
                ) : (
                  <input
                    autoFocus
                    value={answers[step.key] || ''}
                    onChange={(e) => set({ [step.key]: e.target.value })}
                    placeholder={step.placeholder || 'Tu respuesta…'}
                    className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876]"
                    style={{ borderColor: '#FBD5B8', color: ORANGE }}
                  />
                )}
              </div>
            )}

            {step.type === 'number' && (
              <div className="max-w-xs">
                <div className="flex items-baseline gap-3 border-b-2 pb-2" style={{ borderColor: ORANGE }}>
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={answers[step.key] || ''}
                    onChange={(e) => set({ [step.key]: e.target.value.replace(/[^0-9.,]/g, '') })}
                    placeholder="0"
                    className="w-full bg-transparent font-extrabold outline-none placeholder:text-slate-300"
                    style={{ color: BLUE, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
                  />
                  {step.unit && <span className="text-2xl font-bold shrink-0" style={{ color: '#8B87C9' }}>{step.unit}</span>}
                </div>
                {step.optional && <p className="text-slate-400 text-sm mt-3">Opcional: puedes dejarlo vacío.</p>}
              </div>
            )}

            {step.type === 'multitext' && (
              <div className="max-w-md flex flex-col gap-3">
                {((answers[step.key] && answers[step.key].length ? answers[step.key] : ['']) ).map((val, i) => (
                  <input
                    key={i}
                    value={val}
                    disabled={!!answers[`${step.key}_none`]}
                    onChange={(e) => {
                      const cur = [...(answers[step.key] || [''])];
                      cur[i] = e.target.value;
                      set({ [step.key]: cur });
                    }}
                    placeholder={step.placeholder || 'Escribe aquí…'}
                    className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] disabled:opacity-40"
                    style={{ borderColor: '#FBD5B8', color: ORANGE }}
                  />
                ))}
                {!answers[`${step.key}_none`] && (
                  <button
                    type="button"
                    onClick={() => set({ [step.key]: [...(answers[step.key] || ['']), ''] })}
                    className="text-left text-[#3932C0] font-bold hover:underline cursor-pointer"
                  >
                    + añadir otro
                  </button>
                )}
                <label className="flex items-center gap-3 cursor-pointer select-none mt-2">
                  <input
                    type="checkbox"
                    checked={!!answers[`${step.key}_none`]}
                    onChange={(e) => set({ [`${step.key}_none`]: e.target.checked })}
                    className="h-5 w-5 rounded accent-[#FF690B] cursor-pointer"
                  />
                  <span className="text-sm text-[#363C98]/80">{step.noneLabel || 'Marca solo si no consumes nada aquí'}</span>
                </label>
              </div>
            )}

            {step.type === 'mealtext' && (
              <div className="max-w-md flex flex-col gap-3">
                <textarea
                  rows={4}
                  value={answers[step.key] || ''}
                  disabled={!!answers[`${step.key}_none`]}
                  onChange={(e) => set({ [step.key]: e.target.value })}
                  placeholder={step.placeholder || 'Cantidades aproximadas, sin buscar la perfección…'}
                  className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none disabled:opacity-40"
                  style={{ borderColor: '#FBD5B8', color: ORANGE }}
                />
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!answers[`${step.key}_none`]}
                    onChange={(e) => set({ [`${step.key}_none`]: e.target.checked })}
                    className="h-5 w-5 rounded accent-[#FF690B] cursor-pointer"
                  />
                  <span className="text-sm text-[#363C98]/80">{step.noneLabel || 'Marca solo si no consumes nada aquí'}</span>
                </label>
              </div>
            )}

            {step.type === 'consent' && (
              <label className="flex items-start gap-3 cursor-pointer select-none max-w-md mt-2">
                <input
                  type="checkbox"
                  checked={!!answers[step.key]}
                  onChange={(e) => set({ [step.key]: e.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 rounded accent-[#FF690B] cursor-pointer"
                />
                <span className="text-[#363C98]/90 leading-snug">{step.label}</span>
              </label>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="max-w-xl w-full mx-auto mt-8">
          <button
            onClick={isLast ? handleFinish : goNext}
            disabled={!isValid || saving}
            className={`w-full rounded-2xl py-4 font-bold text-white text-lg cursor-pointer disabled:cursor-not-allowed sf-cta ${isValid && !saving ? 'is-enabled' : ''}`}
            style={{ backgroundColor: isValid && !saving ? BLUE : '#C6C3E8' }}
          >
            {saving ? 'Guardando…' : isLast ? 'Enviar mis respuestas' : index === 0 ? 'Empezar' : 'Continuar'}
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

      {/* ===== DERECHA: logo + fases ===== */}
      <aside className="hidden lg:flex w-[34%] max-w-md flex-col items-center bg-[#F3F2F9] px-10 py-12">
        <Image src="/LogotipoSquatfit.png" width={88} height={88} alt="Squad Fit" className="mb-12" />
        <p className="text-[#8B87C9] font-bold mb-8 text-center">{formTitle}</p>
        <div className="flex flex-col gap-4 items-center">
          {phases.map((p) => {
            const active = step.phase === p;
            return (
              <span key={p} className={`text-base text-center transition-colors ${active ? 'font-extrabold' : ''}`} style={{ color: active ? BLUE : '#A9A6CE' }}>
                {p}
              </span>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
