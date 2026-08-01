"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, Users, Flame, Wrench } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import AccessNotice from "@/app/components/AccessNotice";
import FreeSampleBadge from "@/app/components/FreeSampleBadge";
import { useSystemRecipes } from "@/app/components/useSystemRecipes";
import {
  trackRecipeEvent,
  flushRecipeMetrics,
  ReadingTimer,
  registerActiveReading,
  unregisterActiveReading,
} from "@/app/components/recipeMetrics";

// Sin imagen real: mismo criterio visual que ya usa Mi cocina para portadas
// de libro (panel-cocina/page.js, getValidImageUrl) — no se inventa ninguna.
function getValidImageUrl(url) {
  if (!url) return "/group32.png";
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

const byPriority = (a, b) => (a?.priority ?? 9999) - (b?.priority ?? 9999);

// `recipe.kcal` (mapeo del backend: la columna se llama `description`, ver
// migración 20260725000003_recipes_admin_support.ts) es texto libre — a
// veces solo el número, a veces "350 kcal" ya escrito. Si es un número
// pelado se le añade la unidad; si no, se enseña tal cual llega.
function formatKcal(kcal) {
  if (kcal === null || kcal === undefined) return null;
  const text = String(kcal).trim();
  if (!text) return null;
  return /^\d+$/.test(text) ? `${text} kcal` : text;
}

function RecetaPageContent({ params }) {
  const { id: recipeId } = React.use(params);
  const searchParams = useSearchParams();
  // Enlace de vuelta opcional a un libro concreto, si se llegó desde su
  // lista de recetas nativas (?from=<bookId>&v=<versionId>). Sin ellos
  // (enlace directo/compartido), vuelve a Mi cocina — el mismo criterio que
  // ya usa el lector del libro con `redirect` en AccessNotice.
  const fromBook = searchParams.get("from");
  const fromVersion = searchParams.get("v");
  const backHref = fromBook
    ? `/panel-cocina/libro/${fromBook}${fromVersion ? `?v=${fromVersion}` : ""}`
    : "/panel-cocina";

  const { token } = useAuthStore();
  const { loading, checked, recipes } = useSystemRecipes();

  const recipe = useMemo(
    () => recipes.find((r) => r.id === recipeId) || null,
    [recipes, recipeId],
  );

  // ── Medición: apertura + tiempo de lectura, a nivel de receta ───────────
  // Arranca solo cuando la receta se ha encontrado de verdad (nunca antes:
  // no hay "abierto" si no hay nada que enseñar) y se cierra al salir de
  // esta ficha — navegar a otra pantalla o desmontarse — mandando el tiempo
  // activo acumulado. Ver recipeMetrics.js para la red de seguridad de
  // pagehide (cerrar la pestaña entera).
  useEffect(() => {
    if (!recipe) return undefined;
    const timer = new ReadingTimer();
    registerActiveReading(recipe.id, timer);
    trackRecipeEvent("open", { recipeId: recipe.id });
    return () => {
      unregisterActiveReading(timer);
      const elapsedMs = timer.stop();
      trackRecipeEvent("read_time", { recipeId: recipe.id, durationSeconds: elapsedMs / 1000 });
      flushRecipeMetrics();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id]);

  if (!token) return <AccessNotice redirect={`/panel-cocina/receta/${recipeId}`} />;

  if (loading || !checked) {
    return (
      <div className="w-full min-h-screen bg-transparent flex items-center justify-center pt-8 pl-8 pr-12 pb-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3932C0]" />
          <p className="text-[#3932C0] font-semibold text-lg">Cargando receta...</p>
        </div>
      </div>
    );
  }

  // No está en lo que devolvió el backend: o no existe, o no es de muestra
  // gratuita y no tienes acceso a la biblioteca. El backend no distingue
  // los dos casos en la respuesta, así que tampoco lo hacemos nosotros —
  // nunca se asume acceso por nuestra cuenta.
  if (!recipe) {
    return (
      <div className="w-full min-h-screen bg-transparent flex flex-col pt-8 pl-8 pr-12 pb-12">
        <div className="w-full flex items-center mb-6">
          <Link href={backHref} className="flex items-center gap-3 text-[#3932C0] hover:opacity-80 transition-opacity cursor-pointer">
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            <h1 className="text-3xl font-bold">Volver</h1>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <span className="text-5xl">🔒</span>
          <p className="text-[#3932C0] font-semibold text-xl">
            No hemos encontrado esta receta, o no tienes acceso a ella.
          </p>
          <Link href="/panel-cocina">
            <button className="mt-4 bg-[#3932C0] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#3932C0]/90 transition-colors cursor-pointer">
              Volver a Mi cocina
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const kcal = formatKcal(recipe.kcal);
  const ingredients = Array.isArray(recipe.ingredients) ? [...recipe.ingredients].sort(byPriority) : [];
  const preparation = Array.isArray(recipe.preparation) ? [...recipe.preparation].sort(byPriority) : [];
  const materials = Array.isArray(recipe.materials) ? recipe.materials : [];
  const toppings = Array.isArray(recipe.toppings) ? recipe.toppings : [];
  // nutritional_value.calories llega siempre a 0 desde el backend (columna
  // sin escribir todavía, ver recipe.repository.ts) — las kcal de verdad son
  // `recipe.kcal`. Por eso aquí solo se enseñan carbohidratos/proteínas/grasas.
  const nutritional = recipe.nutritional_value || {};
  const macroRows = [
    ["Carbohidratos", nutritional.carbohydrates],
    ["Proteínas", nutritional.proteins],
    ["Grasas", nutritional.fats],
  ].filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col p-6 md:p-10 pb-16 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl mx-auto">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#FF690B] transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> {fromBook ? "Volver al libro" : "Mi cocina"}
        </Link>

        {recipe.is_free_sample && <FreeSampleBadge className="mb-3" />}

        <h1 className="text-[#363C98] text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
          {recipe.name || "Receta"}
        </h1>

        {/* Chips de datos rápidos: cada uno solo si el dato viene */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {kcal && (
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-full px-3.5 py-1.5 text-sm font-bold text-[#FF690B]">
              <Flame className="w-4 h-4" /> {kcal}
            </span>
          )}
          {!!recipe.racion && (
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-full px-3.5 py-1.5 text-sm font-bold text-[#363C98]">
              <Users className="w-4 h-4" /> {recipe.racion} {Number(recipe.racion) === 1 ? "ración" : "raciones"}
            </span>
          )}
          {!!(recipe.time_to_prepare || recipe.time_to_cook) && (
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-full px-3.5 py-1.5 text-sm font-bold text-[#363C98]">
              <Clock className="w-4 h-4" />
              {[
                recipe.time_to_prepare ? `${recipe.time_to_prepare} min prep.` : null,
                recipe.time_to_cook ? `${recipe.time_to_cook} min cocción` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>

        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-[#FFF6F0] mb-8 shadow-sm">
          <Image
            src={getValidImageUrl(recipe.image)}
            alt={recipe.name || "Receta"}
            fill
            sizes="(max-width: 640px) 100vw, 720px"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          {ingredients.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[#363C98] font-extrabold text-xl mb-4">Ingredientes</h2>
              <ul className="space-y-2.5">
                {ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-start gap-3 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF690B] shrink-0 mt-2.5" />
                    <span>
                      <span className="font-semibold">{ing.title}</span>
                      {ing.subtitle && <span className="text-slate-400"> — {ing.subtitle}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {preparation.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[#363C98] font-extrabold text-xl mb-4">Preparación</h2>
              <ol className="space-y-4">
                {preparation.map((step, i) => (
                  <li key={step.id} className="flex items-start gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#FFF6F0] text-[#FF690B] font-extrabold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 leading-relaxed pt-0.5">{step.name}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {toppings.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[#363C98] font-extrabold text-xl mb-4">Toppings</h2>
              <ul className="space-y-2">
                {toppings.map((t) => (
                  <li key={t.id} className="text-slate-700">
                    <span className="font-semibold">{t.title}</span>
                    {t.subtitle && <span className="text-slate-400"> — {t.subtitle}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {materials.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[#363C98] font-extrabold text-xl mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#FF690B]" /> Materiales
              </h2>
              <ul className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <li key={m.id} className="bg-[#F8F9FC] text-slate-600 text-sm font-semibold rounded-full px-3.5 py-1.5">
                    {m.link ? (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF690B]">
                        {m.name}
                      </a>
                    ) : (
                      m.name
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {macroRows.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-[#363C98] font-extrabold text-xl mb-4">Macros</h2>
              <div className="grid grid-cols-3 gap-3">
                {macroRows.map(([label, value]) => (
                  <div key={label} className="bg-[#F8F9FC] rounded-2xl p-3 text-center min-w-0">
                    <p className="text-[#363C98] font-extrabold text-lg leading-none">{value}</p>
                    <p className="text-slate-400 text-[10px] font-semibold mt-1 uppercase break-words">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// `useSearchParams` exige un límite de Suspense (mismo patrón que
// panel-cursos/page.js y panel-ajustes/legal/page.js).
export default function RecetaPage(props) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3932C0]" />
        </div>
      }
    >
      <RecetaPageContent {...props} />
    </Suspense>
  );
}
