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
      <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Cocina</h1>

      {/* ── MI PAUTA ─────────────────────────────────────────────────────────
          Sección movida desde Mi programa: la pauta nutricional (menús) del
          programa vive ahora aquí, encima de la biblioteca de recetas, para
          tener todo lo de comida junto. Solo para usuarios con programa. */}
      {hasProgram && (
        <div className="mb-16 space-y-6">
          <SectionCard Icon={UtensilsCrossed} title="Mi pauta">
            <EmptyState
              text="Tu pauta personalizada aparecerá aquí cuando tu coach la publique."
              hint="Menús, cantidades y notas adaptadas a tu objetivo."
            />
          </SectionCard>
          <SectionCard Icon={Replace} title="Sustituciones de mi pauta">
            <p className="text-slate-500 text-sm leading-relaxed">
              ¿No te encaja un alimento de tu pauta? Justo debajo tienes las
              recetas de tu biblioteca para encontrar alternativas equivalentes.
            </p>
            <EmptyState text="Las tablas de sustituciones de tu pauta aparecerán aquí." />
          </SectionCard>
          <h2 className="text-[#3932C0] text-3xl font-bold pt-4">Mis recetas</h2>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
        </div>
      ) : (isSubscribed && ownedVersions.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          
          {ownedVersions.map((item, index) => (
            <div key={item.versionId || index} className="flex flex-col items-center">
                 <h2 className="text-[#FF690B] text-3xl font-bold mb-6 text-center cursor-pointer">{item.bookTitle}</h2>
                 
                 {/* Image Container with background shape effect */}
                 <div className="relative mb-6 cursor-pointer">
                    <div className="absolute top-4 left-[-10px] w-full h-full bg-[#FFF6F0] rounded-[24px] -z-10 transform scale-105"></div>
                    <Image 
                        src={getValidImageUrl(item.versionImage)}
                        width={300} 
                        height={300} 
                        alt={`${item.bookTitle} - ${item.versionTitle}`} 
                        className="object-cover rounded-[24px]"
                    />
                 </div>

                 <p className="text-[#FF690B] text-3xl mb-8 text-center font-normal cursor-pointer">
                    {item.versionTitle}
                 </p>

                 <Link
                   href={`/panel-cocina/libro/${item.bookId}?v=${item.versionId}`}
                 >
                   <button className="bg-[#3932C0] text-white font-bold py-3 px-12 rounded-xl text-lg hover:bg-[#3932C0]/90 transition-colors shadow-lg cursor-pointer">
                      {item.buttonText || 'Ver mi libro'}
                   </button>
                 </Link>
            </div>
          ))}

        </div>
      ) : (
        /* --- Sin suscripción: primero las muestras gratuitas (si las hay),
            luego la tienda de siempre --- */
        <div className="py-12">
          {freeSampleRecipes.length > 0 && (
            <div className="mb-20">
              <h2 className="text-[#3932C0] text-3xl font-bold mb-2 text-center">Prueba gratis</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto text-center mb-10">
                Estas {freeSampleRecipes.length} recetas están abiertas para que las pruebes antes de suscribirte.
              </p>
              {/* Rejilla de RECETAS, no de libros: son fichas pequeñas y son
                  varias, así que caben de tres en tres en escritorio. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {freeSampleRecipes.map((receta, index) => (
                  <Link
                    key={receta.id || index}
                    href={`/panel-cocina/receta/${receta.id}`}
                    className="group flex flex-col rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-[#FFF6F0]">
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
                      <h3 className="text-[#3932C0] text-xl font-bold leading-snug">
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
            <h2 className="text-[#3932C0] text-3xl font-bold mb-4">
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
