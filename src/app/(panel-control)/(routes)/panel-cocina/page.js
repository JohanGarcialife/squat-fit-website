"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { BookOpen, Lock, ArrowRight, UtensilsCrossed, Replace, Flame, Clock } from "lucide-react";
import RichProductCards from "@/app/components/RichProductCards";
import AccessNotice from "@/app/components/AccessNotice";
import { handleApiError } from "@/app/components/handleApiError";
import { useProgramAccess } from "@/app/components/useProgramAccess";
import { useSystemRecipes } from "@/app/components/useSystemRecipes";
import { SectionCard, EmptyState } from "@/app/components/ProgramSections";
// El clic "ver mi libro" / "probar gratis" mandaba trackRecipeEvent con
// book_id/version_id — retirado (ver panel-cocina/libro/[id]/page.js): esa
// medición no cabe en el contrato real (content_id = recipe.id) sin
// ensuciar el ranking de recetas, y el libro entero no dice qué RECETA es
// popular, que es lo único que decide una muestra gratis.
import FreeSampleBadge from "@/app/components/FreeSampleBadge";

export default function CocinaPage() {
  const { token, isSubscribed } = useAuthStore();
  // Mi pauta: los menús del programa viven aquí (todo lo de comida junto).
  // Solo se enseña si el usuario tiene programa activo (advice/by-user).
  const { hasProgram } = useProgramAccess();
  // Muestras gratuitas: el backend ya decide qué devuelve según el acceso
  // (`RecipeService.getSystemRecipes`) — con biblioteca, todas las recetas
  // activas; sin ella, SOLO las marcadas `is_free_sample`. Mismo hook que usan
  // el lector del libro y la ficha de receta, así se pide una sola vez.
  const { recipes: systemRecipes } = useSystemRecipes();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clean potentially malformed image URLs from API
  const getValidImageUrl = (url) => {
    if (!url) return '/group32.png';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const fetchBooks = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;

      // Obtener libros directamente de /book/all
      const allRes = await axios.get(`${API}/api/v1/book/all`, { headers });
      const allBooks = allRes.data;

      if (Array.isArray(allBooks)) {
        setBooks(allBooks);
      } else {
        setBooks([]);
      }
    } catch (error) {
      // Token caducado → re-login en vez de la tienda "no tienes acceso".
      if (handleApiError(error, '/panel-cocina')) return;
      console.error("Error al obtener libros:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Antes esto solo se pedía con isSubscribed=true. Ahora se pide siempre
    // que haya sesión: el backend es quien decide qué devuelve (biblioteca
    // completa si hay suscripción, y si no, las recetas que vengan marcadas
    // como muestra gratuita — `is_free_sample`). Mientras el backend no
    // mande ese flag a nadie, el resultado para quien no está suscrito sigue
    // siendo "nada", igual que hoy. `isSubscribed` se queda como dependencia
    // para volver a pedir tras el botón "Actualizar" de la tienda.
    if (token) {
      fetchBooks();
    } else {
      setLoading(false);
    }
  }, [token, isSubscribed]);

  const ownedVersions = books.flatMap(book => {
    if (book.versions && book.versions.length > 0) {
      return book.versions.map(version => ({
        bookId: book.id,
        bookTitle: book.title,
        versionId: version.version_id || version.id || book.id,
        versionTitle: version.version_title || version.title || book.title,
        versionImage: version.version_image || book.image || '/group32.png',
        buttonText: `Ver mi libro`
      }));
    } else {
      return [{
        bookId: book.id,
        bookTitle: book.title || book.name || 'Suscripción Digital',
        versionId: book.id || book.book_id,
        versionTitle: book.title || book.name || 'Acceso Completo',
        versionImage: book.image || '/group32.png',
        buttonText: `Ver mi libro`
      }];
    }
  });

  // Recetas de muestra gratuita.
  //
  // Antes esto salía de `/book/all`, filtrando `is_free_sample` a nivel de
  // versión o de libro. **Ese filtro no podía dar nada nunca**: comprobado
  // contra el esquema, la columna `is_free_sample` existe SOLO en `recipe` y
  // en `videos` — ni `books` ni `versions` la tienen. Como el array salía
  // siempre vacío, `ownedVersions` se quedaba a cero y la página caía al
  // «Aún no tienes acceso a la biblioteca», con las 8 muestras marcadas en la
  // base de datos sin llegar jamás a la pantalla.
  //
  // La marca vive en la receta, así que se lee de donde vive. El backend ya
  // devuelve solo las muestras a quien no tiene biblioteca, y se filtra
  // igualmente por `is_free_sample` para no pintar la sección «Prueba gratis»
  // a quien recibe el recetario entero.
  const freeSampleRecipes = (systemRecipes || []).filter(
    (r) => r?.is_free_sample === true,
  );

  // Sin sesión: aviso de acceso (como el resto del panel), no la tienda.
  if (!token) return <AccessNotice redirect="/panel-cocina" />;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 min-h-screen">

      {/* Title */}
      <h1 className="text-[#363C98] text-5xl font-bold mb-16">Cocina</h1>

      {/* ── MI PAUTA ─────────────────────────────────────────────────────────
          Sección movida desde Mi programa: la pauta nutricional (menús) del
          programa vive ahora aquí. Solo para usuarios con programa.
          El recetario ya NO vive en esta página: se ha ido a «Mis recetas»
          (/panel-cocina/recetas), sección propia del menú. Aquí se queda lo de
          la dieta —pauta y sustituciones— y abajo el acceso al recetario. */}
      {hasProgram && (
        <div className="mb-12 space-y-6">
          <SectionCard Icon={UtensilsCrossed} title="Mi pauta">
            <EmptyState
              text="Tu pauta personalizada aparecerá aquí cuando tu coach la publique."
              hint="Menús, cantidades y notas adaptadas a tu objetivo."
            />
          </SectionCard>
          <SectionCard Icon={Replace} title="Sustituciones de mi pauta">
            <p className="text-slate-500 text-sm leading-relaxed">
              ¿No te encaja un alimento de tu pauta? En{' '}
              <Link href="/panel-cocina/recetas" className="text-[#FF690B] font-bold hover:underline">
                Mis recetas
              </Link>{' '}
              tienes toda tu biblioteca para encontrar alternativas equivalentes.
            </p>
            <EmptyState text="Las tablas de sustituciones de tu pauta aparecerán aquí." />
          </SectionCard>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
        </div>
      ) : (isSubscribed && ownedVersions.length > 0) ? (
        /* Con biblioteca: el recetario entero está en «Mis recetas». Aquí solo
           queda la puerta de entrada, con las portadas de los libros. */
        <Link
          href="/panel-cocina/recetas"
          className="group flex flex-col sm:flex-row items-center gap-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex -space-x-6 shrink-0">
            {ownedVersions.slice(0, 3).map((item, index) => (
              <Image
                key={item.versionId || index}
                src={getValidImageUrl(item.versionImage)}
                width={90}
                height={116}
                alt={`${item.bookTitle} - ${item.versionTitle}`}
                className="w-[90px] h-[116px] object-cover rounded-2xl border-4 border-white shadow-md"
              />
            ))}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[#363C98] text-2xl font-bold group-hover:text-[#FF690B] transition-colors">
              Mis recetas
            </h2>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Todas las recetas de {ownedVersions.length === 1 ? 'tu libro' : 'tus libros'}, con
              índice, buscador y filtros por los iconos del libro.
            </p>
            <span className="inline-block mt-3 text-[#FF690B] font-bold group-hover:underline">
              Abrir el recetario →
            </span>
          </div>
        </Link>
      ) : (
        /* --- Sin suscripción: primero las muestras gratuitas (si las hay),
            luego la tienda de siempre --- */
        <div className="py-12">
          {freeSampleRecipes.length > 0 && (
            <div className="mb-20">
              <h2 className="text-[#363C98] text-3xl font-bold mb-2 text-center">Prueba gratis</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto text-center mb-10">
                Estas {freeSampleRecipes.length} recetas están abiertas para que las pruebes antes de suscribirte.
              </p>
              {/* Rejilla de RECETAS, no de libros: son fichas pequeñas y son
                  varias, así que caben de tres en tres en escritorio. */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {freeSampleRecipes.map((receta, index) => (
                  <Link
                    key={receta.id || index}
                    href={`/panel-cocina/receta/${receta.id}`}
                    className="group flex flex-col rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    {/* 3:4, VERTICAL. Estaba en aspect-4/3 (apaisado) y TODAS las fotos del
                        libro son verticales: cada tarjeta recortaba el plato por arriba y
                        por abajo para meterlo en un hueco horizontal. Con la proporción
                        correcta la foto entra entera y la rejilla gana altura, que es
                        justo lo que luce en un recetario. */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF6F0]">
                      <Image
                        src={getValidImageUrl(receta.image)}
                        alt={receta.name || 'Receta de muestra'}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <FreeSampleBadge className="absolute top-3 left-3" />
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                      {/* El endpoint devuelve `name`; `title` viene siempre a
                          null en estas recetas, así que no se usa. */}
                      <h3 className="text-[#363C98] text-xl font-bold leading-snug">
                        {receta.name || 'Receta'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {receta.kcal && (
                          <span className="inline-flex items-center gap-1">
                            <Flame className="w-4 h-4 text-[#FF690B]" /> {receta.kcal} kcal
                          </span>
                        )}
                        {receta.time_to_prepare && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4 text-[#FF690B]" /> {receta.time_to_prepare} min
                          </span>
                        )}
                      </div>
                      <span className="mt-2 text-[#FF690B] font-bold group-hover:underline">
                        Ver la receta →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className="text-[#363C98] text-3xl font-bold mb-4">
              Aún no tienes acceso a la biblioteca
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Suscríbete a la <strong>Biblioteca Digital de Squad Fit</strong> para acceder a todas las recetas y contenido exclusivo de cocina fit, con 5 recetas nuevas cada semana.
            </p>
          </div>
          
          <RichProductCards
            show={['cocina']}
            verifyLoading={loading}
            onVerifyAccess={async () => {
              setLoading(true);
              await useAuthStore.getState().refreshSubscriptionStatus();
              setLoading(false);
            }}
          />
        </div>
      )}

    </div>
  );
}
