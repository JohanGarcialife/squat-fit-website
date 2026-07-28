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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoEspagueti from './LogoEspagueti';
import TextareaMeter from './TextareaMeter';
import Typewriter from './Typewriter';
import { ExitButton, BackButton, StepCounter, FormAside, StepsDrawer, SoundButton, useMicroFeedback, PausaPantalla, PAUSA_MS, ChildField, InfoBlock, Badge } from './FormChrome';
import { playSelect, playAdvance, playFinish, playKeypress, unlockAudio } from './formSounds';
import { moverFocoOpciones, elegirOpcionEnfocada, escribiendoEnCampo, bloquearTeclasDeOpciones } from './formOptionKeys';

const BLUE = '#363C98';
const ORANGE = '#FF690B';

const OTHER_PREFIX = 'Otro: ';

// El título se escribe algo más rápido que el cuerpo del texto.
const TITLE_SPEED = 11;

// Pausa entre pulsar Continuar y que entre la pantalla siguiente.
const ADVANCE_DELAY = 520;

// Lo que tarda la portada en apartarse (ver --ms-portada-out).
const PORTADA_OUT_MS = 1200;

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
  const [stepsOpen, setStepsOpen] = useState(false);
  const { marcar: marcarGesto } = useMicroFeedback();
  // Frase de la pausa a pantalla completa entre una pregunta y la siguiente.
  const [pausa, setPausa] = useState(null);
  // Portada: nada se escribe hasta pulsar «Empezar». Ese clic es el gesto que el
  // navegador exige para dejar sonar el audio (ver la portada, más abajo).
  const [started, setStarted] = useState(false);
  const [saliendoPortada, setSaliendoPortada] = useState(false);
  // El contenido espera a que termine de escribirse el título.
  const [titleDone, setTitleDone] = useState(false);
  // Y el botón espera a que termine de escribirse TODO el texto de la pantalla.
  const [bodyDone, setBodyDone] = useState(false);
  // Pasos ya vistos: al volver atrás el texto sale de golpe (ya se leyó).
  const seenSteps = useRef(new Set());

  // Pasos visibles según condicionales (se recalcula con cada respuesta).
  const steps = useMemo(
    () => allSteps.filter((s) => !s.showIf || s.showIf(answers, context)),
    [allSteps, answers, context]
  );
  const step = steps[Math.min(index, steps.length - 1)];
  const total = steps.length;

  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));
  // Elegir una opción: mismo `set` pero con su sonido.
  const choose = (patch) => { playSelect(); set(patch); };


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
    if (!puedeAvanzar) return;
    playAdvance();
    setOtherDraft('');
    if (index >= total - 1) return;
    // Cada 3-5 respuestas toca pausa a pantalla completa: tapa la pregunta
    // siguiente hasta que se va, para cortar la inercia de ir a toda prisa.
    const frase = step.type !== 'intro' ? marcarGesto() : null;
    if (frase) {
      setPausa(frase);
      setTimeout(() => { setPausa(null); setIndex((i) => i + 1); }, PAUSA_MS);
      return;
    }
    setTimeout(() => setIndex((i) => i + 1), ADVANCE_DELAY);
  };
  const goBack = () => { setOtherDraft(''); setIndex((i) => Math.max(0, i - 1)); };

  // Volver a una fase ya completada desde el mapa de navegación.
  const goToPhase = (fase) => {
    const destino = steps.findIndex((st) => st.phase === fase);
    if (destino > -1 && destino < index) { setOtherDraft(''); setIndex(destino); }
  };

  const handleFinish = async () => {
    if (!puedeAvanzar || saving) return;
    playFinish();
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

  // Mientras el cajón de pasos o la pausa tapan la pregunta, las flechas y el
  // Enter no deben tocar las opciones de debajo. Y el formulario entero se
  // marca `inert`: deja de ser enfocable y desaparece del árbol de
  // accesibilidad, para que el Tab no llegue a lo que hay detrás y un lector de
  // pantalla no lea la pregunta que no se está viendo.
  const tapado = stepsOpen || pausa !== null;
  bloquearTeclasDeOpciones(tapado);

  const progress = total > 1 ? Math.round((index / (total - 1)) * 100) : 0;
  const isLast = index === total - 1;
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

  // ── Enter = Continuar (petición de Hamlet) ────────────────────────────────
  // Pulsar Enter avanza (o envía en el último paso) si la respuesta es válida.
  // EXCEPCIÓN: dentro de un textarea (párrafo) Enter hace su salto de línea
  // normal; ahí se muestra una pista bajo el campo. Se usa un ref para que el
  // listener global lea siempre el estado actual sin re-suscribirse.
  const enterRef = useRef(null);
  enterRef.current = () => {
    if (sent || saving || !step) return;
    if (isLast) handleFinish();
    else goNext();
  };
  useEffect(() => {
    const onKey = (e) => {
      const escribiendo = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      // Tecleo discreto mientras el usuario escribe en un campo.
      if (escribiendo && !e.repeat && (e.key.length === 1 || e.key === 'Backspace')) playKeypress();

      // Flechas ↑/↓: mover el resaltado entre las opciones, como un menú.
      // Dentro de un campo no se tocan: ahí ya significan otra cosa.
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
      // avanza; si ya lo está, avanza.
      if (elegirOpcionEnfocada(t)) { e.preventDefault(); return; }

      e.preventDefault();
      enterRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Bajo los párrafos: semáforo de longitud (y, con el campo vacío, el recordatorio
  // de que Enter no envía). El objetivo va en `targetChars` de cada pregunta.
  const textareaHint = step ? (
    <TextareaMeter value={answers[step.key]} targetChars={step.targetChars} />
  ) : null;

  if (sent && renderResult) {
    return renderResult(result);
  }

  if (sent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        {/* Punto 10: pantalla de solo lectura → medio segundo de respiro y
            luego los bloques encendiéndose de uno en uno. Aquí el respiro se
            gana el sueldo: el usuario acaba de pulsar «Enviar» y la
            celebración cae mejor un instante después que a la vez que el clic.
            El botón entra el último, con el resto: dejarlo visible sobre una
            pantalla todavía vacía quedaba raro. */}
        <div className="sf-screen-in max-w-lg flex flex-col items-center">
          <InfoBlock orden={0} className="text-6xl mb-4">🎉</InfoBlock>
          <InfoBlock
            as="h1"
            orden={1}
            className="font-extrabold mb-4"
            style={{ color: BLUE, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}
          >
            ¡Formulario enviado!
          </InfoBlock>
          <InfoBlock as="p" orden={2} className="text-[#6B6BA8] text-lg leading-relaxed mb-8">
            Hemos guardado tus respuestas de «{formTitle}». Tu coach las tendrá
            en cuenta para ajustar tu plan.
          </InfoBlock>
          <InfoBlock orden={3} className="w-full max-w-xs">
            <Link
              href={exitHref}
              className="sf-cta is-enabled block w-full rounded-2xl py-4 font-bold text-white text-lg text-center cursor-pointer"
              style={{ backgroundColor: ORANGE }}
            >
              Volver a mi panel
            </Link>
          </InfoBlock>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const choiceStyle = (active) => (active
    ? { borderColor: ORANGE, backgroundColor: '#FFF6F0', color: ORANGE, boxShadow: '0 2px 10px rgba(255,105,11,0.15)' }
    : { borderColor: '#E7E6F5', backgroundColor: '#fff', color: BLUE });

  const isOtherSelected = typeof answers[step.key] === 'string' && answers[step.key].startsWith(OTHER_PREFIX);

  // ===== Portada =====
  // Entrar a un formulario con el texto ya escribiéndose no da tiempo a
  // situarse; y, sobre todo, el navegador no deja sonar nada hasta que el
  // usuario toca algo, así que sin este botón la primera pantalla se escribiría
  // en silencio y se perdería el efecto.
  if (!started) {
    return (
      <div className="min-h-[100svh] w-full flex flex-col items-center justify-center px-6 text-center bg-white">
        <div className={`max-w-lg flex flex-col items-center ${saliendoPortada ? 'sf-portada-out' : 'sf-screen-in'}`}>
          <LogoEspagueti tamano={110} saliendo={saliendoPortada} className="mb-8" />
          <div className="sf-portada-texto flex flex-col items-center">
            <h1 className="font-extrabold mb-4" style={{ color: BLUE, fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)' }}>
              {formTitle}
            </h1>
            <p className="text-[#6B6BA8] text-lg leading-relaxed mb-9">
              Tómate tu tiempo para contestar: cuanto mejor sean tus respuestas,
              mejor podremos ayudarte.
            </p>
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playAdvance();
                const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                if (sinMovimiento) { setStarted(true); return; }
                setSaliendoPortada(true);
                setTimeout(() => setStarted(true), PORTADA_OUT_MS);
              }}
              className="sf-cta is-enabled w-full max-w-xs rounded-2xl py-4 font-bold text-white text-lg cursor-pointer"
              style={{ backgroundColor: BLUE }}
            >
              Empezar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] lg:min-h-screen w-full flex">
      {/* ===== IZQUIERDA: pregunta activa ===== */}
      <div inert={tapado || undefined} className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8 relative">
        <div className="flex items-center gap-4 mb-10 sm:mb-14">
          <div className="flex-1 h-2.5 rounded-full bg-[#DEDCF5] overflow-hidden">
            <div className="h-full rounded-full sf-progress-fill" style={{ width: `${progress}%`, backgroundColor: BLUE }} />
          </div>
          <SoundButton />
          <ExitButton href={exitHref} />
        </div>

        <div key={`${step.key || step.type}-${index}`} className="flex-1 flex flex-col max-w-xl w-full mx-auto sf-screen-in">
          {/* Punto 11: la fase va en píldora, no en texto suelto. Dice DÓNDE
              estás, y en pastilla se lee como una etiqueta en vez de
              confundirse con un antetítulo de la pregunta. */}
          {step.phase && (
            <Badge className="mb-2.5" style={{ backgroundColor: '#FFF1E7', color: ORANGE }}>
              {step.phase}
            </Badge>
          )}
          <Typewriter
            as="h1"
            key={stepId}
            text={step.title}
            speed={TITLE_SPEED}
            instant={alreadySeen}
            sound="title"
            className="font-extrabold leading-tight mb-3"
            style={{ color: BLUE, fontSize: 'clamp(1.35rem, 2.1vw, 1.9rem)' }}
          />
          {step.subtitle && titleDone && (
            <p className="text-[#6B6BA8] text-base sm:text-lg mb-6 sf-stagger">{step.subtitle}</p>
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

            {(step.type === 'radio' || step.type === 'scale') && (
              <div className="flex flex-col gap-3 max-w-md" data-opciones role="radiogroup" aria-label={step.title}>
                {step.options.map((opt, i) => {
                  const label = typeof opt === 'object' ? opt.label : opt;
                  const value = step.type === 'scale' ? (typeof opt === 'object' ? opt.value : i + 1) : label;
                  const active = answers[step.key] === value;
                  return (
                    <button
                      key={label}
                      type="button"
                      data-opcion
                      data-elegida={active ? 'true' : undefined}
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        const patch = { [step.key]: value };
                        if (step.type === 'scale') patch[`${step.key}_label`] = label;
                        choose(patch);
                      }}
                      className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg cursor-pointer text-left sf-choice sf-stagger ${active ? 'is-selected' : ''}`}
                      style={{ '--i': i, ...choiceStyle(active) }}
                    >
                      {label}
                    </button>
                  );
                })}
                {/* «Otro: ___» entra en el recorrido de las flechas como una
                    opción más. Es importante que lleve `data-elegida` cuando
                    está activa: si no, al pulsar ↑/↓ el recorrido no la ve como
                    la respuesta actual, entra por la primera opción fija y el
                    siguiente Enter borraría el texto que el usuario escribió
                    aquí sin avisar. */}
                {step.allowOther && (
                  <div
                    data-opcion
                    data-elegida={isOtherSelected ? 'true' : undefined}
                    role="radio"
                    aria-checked={isOtherSelected}
                    tabIndex={0}
                    className={`rounded-2xl border-2 px-5 py-3.5 font-bold text-[17px] sm:text-lg cursor-pointer sf-choice ${isOtherSelected ? 'is-selected' : ''}`}
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
                  <>
                    <textarea
                      autoFocus
                      rows={4}
                      value={answers[step.key] || ''}
                      onChange={(e) => set({ [step.key]: e.target.value })}
                      placeholder={step.placeholder || 'Tu respuesta…'}
                      className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none"
                      style={{ borderColor: '#FBD5B8', color: ORANGE }}
                    />
                    {textareaHint}
                  </>
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
                    className="text-left text-[#363C98] font-bold hover:underline cursor-pointer"
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
                <div>
                  <textarea
                    rows={4}
                    value={answers[step.key] || ''}
                    disabled={!!answers[`${step.key}_none`]}
                    onChange={(e) => set({ [step.key]: e.target.value })}
                    placeholder={step.placeholder || 'Cantidades aproximadas, sin buscar la perfección…'}
                    className="w-full rounded-2xl border-2 px-5 py-3.5 font-bold outline-none bg-[#FFF9F5] placeholder:font-semibold placeholder:text-[#F0A876] resize-none disabled:opacity-40"
                    style={{ borderColor: '#FBD5B8', color: ORANGE }}
                  />
                  {!answers[`${step.key}_none`] && textareaHint}
                </div>
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
            </>)}
          </form>
        </div>

        {/* Pie */}
        <div className="max-w-xl w-full mx-auto mt-8">
          <button
            onClick={isLast ? handleFinish : goNext}
            disabled={!puedeAvanzar || saving}
            className={`w-full rounded-2xl py-4 font-bold text-white text-lg cursor-pointer disabled:cursor-not-allowed sf-cta ${puedeAvanzar && !saving ? 'is-enabled' : ''}`}
            style={{ backgroundColor: puedeAvanzar && !saving ? BLUE : '#C6C3E8' }}
          >
            {saving ? 'Guardando…' : isLast ? 'Enviar mis respuestas' : index === 0 ? 'Empezar' : 'Continuar'}
          </button>
          <div className="flex items-center justify-between mt-4">
            {index > 0 ? <BackButton onClick={goBack} /> : <span />}
            <StepCounter index={index} total={total} onOpen={() => setStepsOpen(true)} />
          </div>
        </div>
      </div>

      {/* ===== DERECHA: logo + fases (escritorio) ===== */}
      <FormAside inert={tapado || undefined} title={formTitle} phases={phases} currentPhase={step.phase} onGoTo={goToPhase} />

      {/* Panel de pasos en móvil (desde el contador) */}
      <StepsDrawer
        open={stepsOpen}
        onClose={() => setStepsOpen(false)}
        title={formTitle}
        phases={phases}
        currentPhase={step.phase}
        index={index}
        total={total}
        onGoTo={goToPhase}
      />

      <PausaPantalla texto={pausa} />
    </div>
  );
}
