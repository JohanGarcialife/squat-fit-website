'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import AccessNotice from '@/app/components/AccessNotice';
import { useProgramAccess } from '@/app/components/useProgramAccess';
import { SectionCard, EmptyState, LinkRow, CARD } from '@/app/components/ProgramSections';
import {
  Dumbbell,
  Trophy,
  PlaySquare,
  ArrowRight,
  School,
} from 'lucide-react';
import Spinner from '@/app/components/Spinner'

/**
 * MI ENTRENO — todo lo relacionado con entrenamiento, en su propia pestaña.
 *
 * Aquí vive lo que antes estaba repartido dentro de Mi programa (rutina,
 * rendimiento y técnica de ejercicios). Tienen acceso:
 *   - quien tiene un programa Tu Mejor Versión activo (advice/by-user), y
 *   - quien tiene el curso «Entrena en casa» (course/by-user).
 * Quien no tiene ninguno ve el acceso a contratar el programa, sin datos falsos.
 */
export default function MiEntrenoPage() {
  const { token } = useAuthStore();
  const { loading, hasProgram, hasEntrenaCourse, advice } = useProgramAccess();

  if (!token) return <AccessNotice redirect="/mi-entreno" />;

  if (loading) {
    return (
      <div className="flex-1 bg-[#F8F9FC] flex flex-col justify-center items-center min-h-screen">
        <Spinner size="lg" className="mb-4" />
        <span className="text-slate-500 font-extrabold text-sm">Cargando tu entreno…</span>
      </div>
    );
  }

  // Sin programa y sin el curso Entrena en casa: acceso a contratarlo.
  if (!hasProgram && !hasEntrenaCourse) {
    return (
      <div className="flex-1 bg-[#F8F9FC] p-6 md:p-10 min-h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#363C98] mb-8">Mi entreno</h1>
          <div className={CARD + ' text-center py-12 px-6'}>
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#FFF6F0] flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-[#FF690B]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#363C98] mb-3">Aún no tienes entrenamiento activo</h2>
            <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
              Aquí verás tu rutina, tu rendimiento y la técnica de ejercicios
              cuando empieces un programa Tu Mejor Versión con nuestro equipo o
              tengas el curso Entrena en casa.
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
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        <h1 className="text-3xl font-extrabold text-[#363C98]">Mi entreno</h1>

        {/* Cabecera del programa activo: datos reales de advice/by-user */}
        {hasProgram && (
          <div className="bg-[#FF690B] text-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">Tu entrenamiento del programa</span>
            <p className="font-extrabold text-2xl leading-tight mt-1">
              {advice?.training_goal_name || 'Tu Mejor Versión'}
            </p>
          </div>
        )}

        {/* ── Rutina del programa ── */}
        {hasProgram && (
          <SectionCard Icon={Dumbbell} title="Mi rutina">
            <EmptyState
              text="Tu rutina de entrenamiento personalizada aparecerá aquí cuando tu coach la publique."
              hint="Días, ejercicios, series y progresiones."
            />
          </SectionCard>
        )}

        {/* ── Curso Entrena en casa ── */}
        {hasEntrenaCourse && (
          <SectionCard Icon={School} title="Entrena en casa">
            <p className="text-slate-500 text-sm leading-relaxed">
              Tienes el curso Entrena en casa: tus clases y tu progreso viven en
              Mis cursos.
            </p>
            <LinkRow
              href="/panel-cursos"
              Icon={PlaySquare}
              title="Ir a mis clases"
              desc="Entrena en casa, en Mis cursos"
            />
          </SectionCard>
        )}

        {/* ── Rendimiento (antes en Mi programa → Mi progreso) ── */}
        {hasProgram && (
          <SectionCard Icon={Trophy} title="Rendimiento">
            <EmptyState
              text="La progresión de tus marcas y cargas de entrenamiento aparecerá aquí."
            />
          </SectionCard>
        )}

        {/* ── Técnica de ejercicios (antes en Mi programa → Recursos) ── */}
        <SectionCard Icon={PlaySquare} title="Técnica de ejercicios">
          <EmptyState text="La biblioteca de técnica (vídeos por ejercicio) aparecerá aquí." />
        </SectionCard>

        {/* Enlace cruzado: la comida vive en Mi cocina */}
        <p className="text-slate-500 text-sm">
          ¿Buscas tu pauta o recetas?{' '}
          <Link
            href="/panel-cocina"
            className="inline-flex items-center gap-1.5 font-bold text-[#FF690B] hover:underline"
          >
            Todo lo de comida está en Mi cocina <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}
