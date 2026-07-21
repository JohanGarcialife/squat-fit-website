'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import AccessNotice from '@/app/components/AccessNotice';
import { handleApiError } from '@/app/components/handleApiError';
import BrandTabs from '@/app/components/BrandTabs';
import {
  ClipboardList,
  CalendarCheck,
  CalendarRange,
  UtensilsCrossed,
  Dumbbell,
  Pill,
  MessageSquareText,
  ListTodo,
  Scale,
  Camera,
  LineChart,
  Gauge,
  Trophy,
  BookOpen,
  PlaySquare,
  FileDown,
  Replace,
  HelpCircle,
  Target,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

const CARD = 'bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm';

// Formularios del programa (motor tipo onboarding en /formulario/<slug>).
// Son lo único de "Mi plan" que YA tiene backend real.
const PROGRAM_FORMS = [
  { slug: 'evaluacion-inicial', label: 'Evaluación inicial', desc: 'Para adaptar el proceso a ti', Icon: ClipboardList },
  { slug: 'seguimiento-semanal', label: 'Seguimiento semanal', desc: 'Ajustamos tu semana', Icon: CalendarCheck },
  { slug: 'revision-mensual', label: 'Revisión mensual', desc: 'Evaluamos tu progreso', Icon: CalendarRange },
];

const TABS = [
  { id: 'plan', label: 'Mi plan' },
  { id: 'progreso', label: 'Mi progreso' },
  { id: 'recursos', label: 'Recursos' },
];

// Encabezado de cada sub-sección dentro de una pestaña.
function SectionCard({ Icon, title, children }) {
  return (
    <section className={CARD + ' space-y-4'}>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="bg-[#FFF6F0] p-2.5 rounded-2xl text-[#FF690B]"><Icon className="w-6 h-6" /></div>
        <h3 className="text-[#363C98] font-extrabold text-xl">{title}</h3>
      </div>
      {children}
    </section>
  );
}

// Estado vacío honesto para las áreas cuyo backend aún no existe: cuando el
// coach publique el contenido real, se sustituye por los datos; mientras
// tanto NO se muestra nada inventado.
function EmptyState({ text, hint }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1 mb-3">
        En preparación
      </span>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
      {hint && <p className="text-slate-400 text-xs leading-relaxed mt-2">{hint}</p>}
    </div>
  );
}

// Fila-enlace reutilizable (a formularios, Mi Cocina, contacto…).
function LinkRow({ href, Icon, title, desc }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-[#FF690B]/40 transition-all group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-2 bg-[#FFF6F0] rounded-xl shrink-0">
          <Icon className="text-[#FF690B] w-6 h-6" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[#363C98] truncate">{title}</h4>
          {desc && <p className="text-slate-400 text-sm truncate">{desc}</p>}
        </div>
      </div>
      <ChevronRight className="text-slate-300 w-5 h-5 shrink-0 group-hover:text-[#FF690B] transition-colors" />
    </Link>
  );
}

// Enlace contextual Pauta → Mi Cocina (recetas y alternativas).
function CocinaLink({ text = 'Ver recetas y alternativas en Mi cocina' }) {
  return (
    <Link
      href="/panel-cocina"
      className="inline-flex items-center gap-2 text-sm font-bold text-[#FF690B] hover:underline"
    >
      {text} <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

export default function MiProgramaPage() {
  const { token } = useAuthStore();
  const [tab, setTab] = useState('plan');
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      // Detección del programa activo: el objeto advice existe si el usuario
      // tiene asesoría/programa (lo sincronizan los webhooks de Stripe).
      try {
        const res = await axios.get(`${API}/api/v1/advice/by-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && typeof res.data === 'object') setAdvice(res.data);
      } catch (e) {
        // Token caducado → re-login; otro error → simplemente sin programa.
        if (handleApiError(e, '/mi-programa')) return;
        /* sin programa activo */
      }
      setLoading(false);
    })();
  }, [token]);

  if (!token) return <AccessNotice redirect="/mi-programa" />;

  if (loading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF690B] mb-4" />
        <span className="text-slate-500 font-extrabold text-sm">Cargando tu programa…</span>
      </div>
    );
  }

  // Sin programa: todos los programas Tu Mejor Versión incluyen esta zona
  // (pauta + entrenamiento + seguimiento); quien no tiene programa ve el
  // acceso a contratarlo, sin datos falsos.
  if (!advice) {
    return (
      <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#363C98] mb-8">Mi programa</h1>
          <div className={CARD + ' text-center py-12 px-6'}>
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#FFF6F0] flex items-center justify-center">
              <Target className="w-8 h-8 text-[#FF690B]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#363C98] mb-3">Aún no tienes un programa activo</h2>
            <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
              Aquí verás tu pauta nutricional, tu entrenamiento y tu seguimiento
              personalizado cuando empieces un programa Tu Mejor Versión con
              nuestro equipo.
            </p>
            <Link
              href="/programa"
              className="inline-block bg-[#FF690B] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#e05b08] active:scale-95 transition-all"
            >
              Conocer el programa
            </Link>
            <p className="text-slate-400 text-sm mt-6">
              ¿Buscas tus formaciones? Están en{' '}
              <Link href="/panel-cursos" className="text-[#FF690B] font-bold hover:underline">Mis cursos</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        <h1 className="text-3xl font-extrabold text-[#363C98]">Mi programa</h1>

        {/* Cabecera del programa activo: datos reales de advice/by-user */}
        <div className="bg-[#FF690B] text-white rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">Objetivo</span>
              <p className="font-extrabold text-2xl leading-tight mt-1">
                {advice.training_goal_name || 'Tu Mejor Versión'}
              </p>
              {advice.subtitle && <p className="text-white/80 font-semibold mt-1">{advice.subtitle}</p>}
            </div>
            {advice.adviser_firstName && (
              <div className="bg-black/15 rounded-2xl p-4 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#363C98] flex items-center justify-center font-bold text-xs">
                  {`${advice.adviser_firstName[0]}${advice.adviser_lastName ? advice.adviser_lastName[0] : ''}`.toUpperCase()}
                </div>
                <div>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider block">Coach asignado</span>
                  <span className="font-extrabold text-sm">
                    {`${advice.adviser_firstName} ${advice.adviser_lastName || ''}`.trim()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <BrandTabs tabs={TABS} active={tab} onChange={setTab} />

        {/* ════════ MI PLAN ════════ */}
        {tab === 'plan' && (
          <div className="space-y-6 animate-fadeIn">
            <SectionCard Icon={ListTodo} title="Hoy">
              <EmptyState
                text="Tus tareas del día aparecerán aquí cuando tu coach publique tu plan."
                hint="Entrenamiento, comidas y hábitos del día, marcables al completarlos."
              />
            </SectionCard>

            <SectionCard Icon={UtensilsCrossed} title="Pauta nutricional">
              <EmptyState
                text="Tu pauta personalizada aparecerá aquí cuando tu coach la publique."
                hint="Menús, cantidades y notas adaptadas a tu objetivo."
              />
              <CocinaLink text="Mientras tanto, explora recetas y alternativas en Mi cocina" />
            </SectionCard>

            <SectionCard Icon={Dumbbell} title="Entrenamiento">
              <EmptyState
                text="Tu rutina de entrenamiento personalizada aparecerá aquí cuando tu coach la publique."
                hint="Días, ejercicios, series y progresiones."
              />
            </SectionCard>

            <SectionCard Icon={Pill} title="Suplementación">
              <EmptyState
                text="Si tu coach te recomienda suplementación, la verás aquí con pautas de uso."
              />
            </SectionCard>

            <SectionCard Icon={MessageSquareText} title="Indicaciones y revisiones">
              <p className="text-slate-500 text-sm leading-relaxed">
                Estos formularios llegan directamente a tu coach y son la base de
                tus revisiones y ajustes.
              </p>
              <div className="space-y-3">
                {PROGRAM_FORMS.map(({ slug, label, desc, Icon }) => (
                  <LinkRow key={slug} href={`/formulario/${slug}`} Icon={Icon} title={label} desc={desc} />
                ))}
              </div>
              <EmptyState
                text="Las indicaciones personalizadas de tu coach (mensajes y ajustes de cada revisión) aparecerán aquí."
              />
            </SectionCard>
          </div>
        )}

        {/* ════════ MI PROGRESO ════════ */}
        {tab === 'progreso' && (
          <div className="space-y-6 animate-fadeIn">
            <SectionCard Icon={LineChart} title="Comparativas">
              <EmptyState
                text="Tu evolución (antes / después) aparecerá aquí a medida que registres check-ins."
              />
            </SectionCard>

            <SectionCard Icon={Scale} title="Peso y medidas">
              <EmptyState
                text="El historial de peso y medidas se construirá con tus check-ins semanales."
              />
              <LinkRow
                href="/profile-panel"
                Icon={Scale}
                title="Actualizar mis datos actuales"
                desc="Peso y altura se editan en tu Perfil"
              />
            </SectionCard>

            <SectionCard Icon={Camera} title="Fotografías">
              <EmptyState
                text="Aquí guardarás tus fotos de progreso para comparar tu cambio físico."
              />
            </SectionCard>

            <SectionCard Icon={CalendarCheck} title="Check-ins">
              <p className="text-slate-500 text-sm leading-relaxed">
                Registra tu semana y tu mes: con estos datos tu coach ajusta el plan.
              </p>
              <div className="space-y-3">
                <LinkRow href="/formulario/seguimiento-semanal" Icon={CalendarCheck} title="Seguimiento semanal" desc="Tu check-in de la semana" />
                <LinkRow href="/formulario/revision-mensual" Icon={CalendarRange} title="Revisión mensual" desc="Balance del mes" />
              </div>
              <EmptyState text="El historial de check-ins enviados aparecerá aquí." />
            </SectionCard>

            <SectionCard Icon={Gauge} title="Adherencia">
              <EmptyState
                text="Tu porcentaje de cumplimiento (entreno, pauta y hábitos) aparecerá aquí."
              />
            </SectionCard>

            <SectionCard Icon={Trophy} title="Rendimiento">
              <EmptyState
                text="La progresión de tus marcas y cargas de entrenamiento aparecerá aquí."
              />
            </SectionCard>
          </div>
        )}

        {/* ════════ RECURSOS ════════ */}
        {tab === 'recursos' && (
          <div className="space-y-6 animate-fadeIn">
            <SectionCard Icon={BookOpen} title="Guías">
              <EmptyState text="Las guías de tu programa aparecerán aquí cuando el equipo las publique." />
            </SectionCard>

            <SectionCard Icon={PlaySquare} title="Vídeos">
              <EmptyState text="Los vídeos de apoyo de tu programa aparecerán aquí." />
            </SectionCard>

            <SectionCard Icon={FileDown} title="Material descargable">
              <EmptyState text="Plantillas y documentos descargables de tu programa aparecerán aquí." />
            </SectionCard>

            <SectionCard Icon={Replace} title="Sustituciones">
              <p className="text-slate-500 text-sm leading-relaxed">
                ¿No te encaja un alimento de tu pauta? En Mi cocina tienes recetas
                y alternativas equivalentes.
              </p>
              <CocinaLink text="Buscar alternativas en Mi cocina" />
              <EmptyState text="Las tablas de sustituciones de tu pauta aparecerán aquí." />
            </SectionCard>

            <SectionCard Icon={Dumbbell} title="Técnica de ejercicios">
              <EmptyState text="La biblioteca de técnica (vídeos por ejercicio) aparecerá aquí." />
            </SectionCard>

            <SectionCard Icon={HelpCircle} title="FAQ">
              <EmptyState text="Las preguntas frecuentes del programa aparecerán aquí." />
              <LinkRow
                href="/panel-contacto"
                Icon={MessageSquareText}
                title="¿Tienes una duda ahora?"
                desc="Escríbenos desde Ayuda y soporte"
              />
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
