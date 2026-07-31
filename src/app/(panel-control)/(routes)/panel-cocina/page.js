"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { BookOpen, Lock, ArrowRight, UtensilsCrossed, Replace } from "lucide-react";
import RichProductCards from "@/app/components/RichProductCards";
import AccessNotice from "@/app/components/AccessNotice";
import { handleApiError } from "@/app/components/handleApiError";
import { useProgramAccess } from "@/app/components/useProgramAccess";
import { SectionCard, EmptyState } from "@/app/components/ProgramSections";
import { trackRecipeEvent } from "@/app/components/recipeMetrics";
import FreeSampleBadge from "@/app/components/FreeSampleBadge";

export default function CocinaPage() {
  const { token, isSubscribed } = useAuthStore();
  // Mi pauta: los menús del programa viven aquí (todo lo de comida junto).
  // Solo se enseña si el usuario tiene programa activo (advice/by-user).
  const { hasProgram } = useProgramAccess();
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

  // Recetas de muestra gratuita: el flag lo trae (o no) el backend en cada
  // versión — `is_free_sample`, a nivel de versión o, si no, a nivel de
  // libro entero. Si el campo nunca llega (backend aún no desplegado), este
  // array queda vacío y todo se comporta exactamente como hoy: la pantalla
  // de "sin suscripción" se enseña sola, sin ninguna sección nueva encima.
  // Ojo: esto NO decide acceso por su cuenta — solo pinta lo que el backend
  // ya haya decidido devolver en /book/all.
  const freeSampleVersions = books.flatMap(book => {
    const versions = book.versions && book.versions.length > 0 ? book.versions : [book];
    return versions
      .filter((version) => version.is_free_sample === true || book.is_free_sample === true)
      .map((version) => ({
        bookId: book.id,
        bookTitle: book.title || book.name || 'Muestra gratis',
        versionId: version.version_id || version.id || book.id,
        versionTitle: version.version_title || version.title || book.title,
        versionImage: version.version_image || book.image || '/group32.png',
      }));
  });

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
                   onClick={() => trackRecipeEvent('click', { book_id: item.bookId, version_id: item.versionId, is_free_sample: false })}
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
          {freeSampleVersions.length > 0 && (
            <div className="mb-20">
              <h2 className="text-[#3932C0] text-3xl font-bold mb-2 text-center">Prueba gratis</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto text-center mb-10">
                Estas recetas están abiertas para que las pruebes antes de suscribirte.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                {freeSampleVersions.map((item, index) => (
                  <div key={item.versionId || index} className="flex flex-col items-center">
                    <FreeSampleBadge className="mb-3" />
                    <h2 className="text-[#FF690B] text-3xl font-bold mb-6 text-center">{item.bookTitle}</h2>

                    <div className="relative mb-6">
                      <div className="absolute top-4 left-[-10px] w-full h-full bg-[#FFF6F0] rounded-[24px] -z-10 transform scale-105"></div>
                      <Image
                        src={getValidImageUrl(item.versionImage)}
                        width={300}
                        height={300}
                        alt={`${item.bookTitle} - ${item.versionTitle}`}
                        className="object-cover rounded-[24px]"
                      />
                    </div>

                    <p className="text-[#FF690B] text-3xl mb-8 text-center font-normal">
                      {item.versionTitle}
                    </p>

                    <Link
                      href={`/panel-cocina/libro/${item.bookId}?v=${item.versionId}`}
                      onClick={() => trackRecipeEvent('click', { book_id: item.bookId, version_id: item.versionId, is_free_sample: true })}
                    >
                      <button className="bg-[#FF690B] text-white font-bold py-3 px-12 rounded-xl text-lg hover:bg-[#e05b08] transition-colors shadow-lg cursor-pointer">
                        Probar gratis
                      </button>
                    </Link>
                  </div>
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
