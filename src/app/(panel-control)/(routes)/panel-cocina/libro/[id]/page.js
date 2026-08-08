"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Clock, Flame, Link as LinkIcon, Menu, Search, Users } from "lucide-react";
import { BookIndexSidebar } from "@/app/(panel-control)/(routes)/panel-control/_components/Sidebar";
import { useAuthStore } from "@/stores/auth.store";
import AccessNotice from "@/app/components/AccessNotice";
import { handleApiError } from "@/app/components/handleApiError";
import { useSystemRecipes } from "@/app/components/useSystemRecipes";
import { trackRecipeEvent } from "@/app/components/recipeMetrics";
import FreeSampleBadge from "@/app/components/FreeSampleBadge";
import axios from "axios";
import Spinner from "@/app/components/Spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.squadfit.es';

// Sin imagen real, mismo criterio que el resto de Mi cocina.
function getValidImageUrl(url) {
  if (!url) return '/group32.png';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

// Relación libro↔receta: YA EXISTE y este lector ya está en uso (2-ago-2026).
//
// El comentario anterior decía que la relación «TODAVÍA NO EXISTE» y que por
// eso esto «siempre devuelve un array vacío». Las dos cosas eran ciertas el
// 31-jul y dejaron de serlo en dos pasos: la migración
// `20260731210000_add_book_id_to_recipe` creó la columna, y
// `20260802090000_seed_recipe_book_id` la sembró con 149 recetas (70 del
// Volumen 1 y 79 del Volumen 2). `recipe/system` devuelve ya el `book_id`
// relleno, así que este filtro casa y el `if (nativas.length > 0)` de más
// abajo enseña la vista moderna en vez del PDF.
//
// Verificado en producción el 2-ago abriendo «Libro de cocina 2» con una
// cuenta SIN biblioteca: salen sus 5 recetas de muestra en tarjetas, y ni
// rastro del PDF.
//
// Se dejan los tres nombres de campo (`book_id`, `version_id`,
// `book_version_id`) a propósito: el que funciona hoy es el primero, y los
// otros dos cuestan nada y cubren que algún día se enlace por versión.
function recipesForBook(recipes, bookId, versionId) {
  if (!Array.isArray(recipes)) return [];
  return recipes.filter(
    (r) => r.book_id === bookId || r.version_id === versionId || r.book_version_id === versionId,
  );
}

// Book index config — fallback mock index in case backend has no content
const fallbackBookIndex = [
  { title: 'Índice',              icon: '📋', page: 1  },
  { title: 'Antes de empezar',    icon: '👋', page: 2  },
  { title: 'Esenciales',          icon: '🍳', page: 3  },
  { title: 'Desayunos',           icon: '☕', page: 4  },
  { title: 'Comidas',             icon: '🍽️', page: 5  },
  { title: 'Cenas',               icon: '🌙', page: 6  },
  { title: 'Snacks',              icon: '🍎', page: 7  },
  { title: 'Postres',             icon: '🧁', page: 8  },
  { title: 'Salsas saladas',      icon: '🥫', page: 9  },
  { title: 'Salsas dulces',       icon: '🍯', page: 10 },
  { title: 'Zona tropical',       icon: '🌴', page: 11 },
  { title: 'Cierre',              icon: '🤍', page: 12 },
];

// Las calorías llegan del backend como número pelado ("210"), porque hoy
// `recipe/system` mapea `recipe.description as kcal` (ver recipe.repository.ts).
// Mismo criterio que la ficha de receta: si es solo dígitos, se le pone la
// unidad; si ya viene con texto, se respeta tal cual.
function formatKcal(kcal) {
  if (kcal === null || kcal === undefined) return null;
  const text = String(kcal).trim();
  if (!text) return null;
  return /^\d+$/.test(text) ? `${text} kcal` : text;
}

// Tiempo total de la receta. 19 de las 149 del recetario no traen ninguno de
// los dos (así vienen del origen), y en esas no se pinta el reloj en vez de
// enseñar un «0 min» que no significa nada.
function totalMinutos(r) {
  const prep = Number(r?.time_to_prepare) || 0;
  const coccion = Number(r?.time_to_cook) || 0;
  const total = prep + coccion;
  return total > 0 ? `${total} min` : null;
}

// Dynamically import the PdfViewer so it doesn't run on the server
const PdfViewer = dynamic(() => import("./_components/PdfViewer"), { ssr: false });

export default function BookReaderPage({ params, searchParams }) {
  const { id: bookId } = React.use(params);
  const resolvedSearch = React.use(searchParams);
  const versionId = resolvedSearch?.v || null;

  const { token } = useAuthStore();

  // Recetas nativas de este libro (si las hay). Se piden en paralelo con el
  // libro/PDF de siempre — mientras no exista relación libro↔receta en el
  // backend, `nativas` queda vacío y este hook no cambia nada de lo de abajo.
  const { checked: recipesChecked, recipes } = useSystemRecipes();
  const nativas = useMemo(
    () => recipesForBook(recipes, bookId, versionId),
    [recipes, bookId, versionId],
  );
  const [busquedaNativa, setBusquedaNativa] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Book state
  const [bookTitle, setBookTitle] = useState('');
  const [versionTitle, setVersionTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [indexes, setIndexes] = useState([]);
  // Muestra gratuita: el flag lo trae (o no) /book/by-id, a nivel de versión
  // o de libro. Si nunca llega, se queda en `false` — no cambia nada más.
  const [isFreeSample, setIsFreeSample] = useState(false);

  useEffect(() => {
    async function loadBook() {
      if (!token || !bookId || !versionId) {
        setLoading(false);
        if (!versionId) setError('No se especificó la versión del libro.');
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // ── Paso 1: obtener el libro y la URL del PDF con /book/by-id ──────────
        // GET /api/v1/book/by-id?book_id={bookId}&version_id={versionId}
        console.log("Solicitando libro por ID:", { book_id: bookId, version_id: versionId });
        const bookRes = await axios.get(`${API_BASE}/api/v1/book/by-id`, {
          params: { book_id: bookId, version_id: versionId },
          headers,
        });

        console.log("Respuesta de /book/by-id:", JSON.stringify(bookRes.data, null, 2));

        const bookData = Array.isArray(bookRes.data) ? bookRes.data[0] : bookRes.data;

        if (!bookData) {
          setError('No se encontró el libro.');
          return;
        }

        setBookTitle(bookData.title || 'Cocina Squad Fit');

        // Buscar la versión específica en la respuesta
        const version = bookData.versions?.find(v =>
          v.version_id === versionId || v.id === versionId
        ) || bookData.versions?.[0];

        console.log("Versión de libro seleccionada:", version);

        if (version) {
          setVersionTitle(version.version_title || version.title || '');
          setIsFreeSample(version.is_free_sample === true || bookData.is_free_sample === true);

          // Extraer URL del PDF — probar varios campos posibles
          const isUrlImage = version.version_url?.includes('pexels.com') || 
                             version.version_url?.match(/\.(jpeg|jpg|gif|png)/i);
          const pdfUrl = (version.version_url?.startsWith('https://') && 
                          version.version_url !== version.version_image && 
                          !isUrlImage)
            ? version.version_url
            : null;

          console.log("URL de PDF extraída:", pdfUrl);

          if (pdfUrl) {
            setPdfFile(pdfUrl.startsWith('http') ? pdfUrl : `/${pdfUrl.replace(/^\//, '')}`);
          } else {
            setError('Este libro aún no tiene un PDF disponible.');
          }
        } else {
          console.log("No se encontró versión en bookData.versions:", bookData.versions);
          setError('No se encontró la versión seleccionada para este libro.');
        }

        // ── Paso 2: cargar índices del libro ────────────────────────────────────
        // GET /api/v1/book/{bookId}/versions/{versionId}/indexes
        try {
          const indexesRes = await axios.get(
            `${API_BASE}/api/v1/book/${bookId}/versions/${versionId}/indexes`,
            { headers }
          );

          let apiIndexes = [];
          if (Array.isArray(indexesRes.data)) {
            apiIndexes = indexesRes.data;
          } else if (indexesRes.data?.indexes && Array.isArray(indexesRes.data.indexes)) {
            apiIndexes = indexesRes.data.indexes;
          }

          if (apiIndexes.length > 0) {
            setIndexes(apiIndexes);
          } else {
            setIndexes(fallbackBookIndex);
          }
        } catch {
          setIndexes(fallbackBookIndex);
        }

      } catch (err) {
        // Token caducado → re-login en vez de un error genérico del lector.
        if (handleApiError(err, '/panel-cocina')) return;
        console.error('Error al cargar el libro:', err);
        setError('Ocurrió un error al cargar el libro. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId, versionId, token]);

  // ── Medición: apertura + tiempo de lectura del PDF — RETIRADA ────────────
  // Esta rama (#91) sustituyó recipeMetrics.js por el contrato real del
  // backend, que solo sabe hablar de una receta (`content_id` = recipe.id).
  // La medición de apertura/lectura del PDF que traía #90 usaba
  // book_id + version_id — dos identificadores que no caben en un único
  // content_id, y encima el PDF agrupa MUCHAS recetas en un solo libro: ni
  // siquiera con acceso al dato serviría para decidir qué RECETA promover a
  // muestra gratis, que es el objetivo declarado de toda esta medición
  // (commit 283dc19). Forzar el libro/versión dentro de content_type:
  // 'recipe' además ensuciaría el ranking real (un id de libro no es un id
  // de receta). Se retira en vez de adaptarse: el lector nativo (arriba,
  // trackRecipeEvent('open', { recipeId }) en receta/[id]/page.js) ya mide
  // lo que de verdad hace falta, y el PDF es el respaldo temporal mientras
  // se completa la migración a recetas nativas.
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage < 1 || newPage > numPages) return prevPageNumber;
      return newPage;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function goToPage(page) {
    if (page >= 1 && (numPages ? page <= numPages : true)) {
      setPageNumber(page);
      setIsSidebarOpen(false); // Close sidebar after navigation
    }
  }

  // Buscador de la lista nativa: un evento "search" por pausa de escritura
  // (debounce), no uno por tecla.
  useEffect(() => {
    const q = busquedaNativa.trim();
    if (!q) return undefined;
    const t = setTimeout(() => {
      trackRecipeEvent('search', { searchTerm: q });
    }, 500);
    return () => clearTimeout(t);
  }, [busquedaNativa]);

  // Sin sesión: aviso de acceso (como el resto del panel), no un lector vacío.
  if (!token) {
    const back = `/panel-cocina/libro/${bookId}${versionId ? `?v=${versionId}` : ''}`;
    return <AccessNotice redirect={back} />;
  }

  // Se espera a los dos: el libro/PDF de siempre Y la comprobación de
  // recetas nativas, para no enseñar el PDF un instante y luego cambiar a
  // la lista nativa (o al revés) delante del cliente.
  if (loading || !recipesChecked) {
    return (
      <div className="w-full min-h-screen bg-transparent flex items-center justify-center pt-8 pl-8 pr-12 pb-12">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#363C98] font-semibold text-lg">Cargando lector...</p>
        </div>
      </div>
    );
  }

  // ── Vista nativa: este libro SÍ tiene recetas nativas asociadas ──────────
  // Reemplaza al PDF por completo. No depende de si el PDF cargó o dio
  // error (`error`/`pdfFile` de abajo): si hay recetas nativas, son ellas
  // las que se enseñan, punto.
  if (nativas.length > 0) {
    const q = busquedaNativa.trim().toLowerCase();
    const visibles = q ? nativas.filter((r) => (r.name || '').toLowerCase().includes(q)) : nativas;
    return (
      <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col p-6 md:p-10 pb-16 animate-in fade-in duration-300">
        <div className="w-full max-w-5xl mx-auto">
          <Link href="/panel-cocina" className="flex items-center gap-3 text-[#363C98] hover:opacity-80 transition-opacity cursor-pointer mb-6">
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            <h1 className="text-3xl font-bold">
              {bookTitle}
              {versionTitle ? <span className="font-normal text-2xl"> ( {versionTitle} )</span> : null}
            </h1>
          </Link>

          <div className="relative max-w-sm mb-8">
            <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaNativa}
              onChange={(e) => setBusquedaNativa(e.target.value)}
              placeholder="Buscar receta…"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-[#363C98] placeholder:text-slate-300 focus:outline-none focus:border-[#FF690B] transition-colors"
            />
          </div>

          {visibles.length === 0 ? (
            <p className="text-slate-400">Nada con «{busquedaNativa.trim()}».</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibles.map((r) => (
                <Link
                  key={r.id}
                  href={`/panel-cocina/receta/${r.id}?from=${bookId}${versionId ? `&v=${versionId}` : ''}`}
                  onClick={() => trackRecipeEvent('click', { recipeId: r.id })}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="relative w-full aspect-square bg-[#FFF6F0]">
                    <Image
                      src={getValidImageUrl(r.image)}
                      alt={r.name || 'Receta'}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {r.is_free_sample && <FreeSampleBadge className="absolute top-3 left-3" />}
                  </div>
                  <div className="p-4">
                    <p className="text-[#363C98] font-bold leading-snug line-clamp-2">{r.name}</p>
                    {/* Calorías, tiempo y raciones. Ya venían en la respuesta de
                        `recipe/system` y la tarjeta las tiraba: quien abre un
                        libro de 79 recetas solo veía nombres, y para saber si
                        una receta le encaja tenía que entrar en cada una. */}
                    {(() => {
                      const kcal = formatKcal(r.kcal);
                      const tiempo = totalMinutos(r);
                      const raciones = Number(r.racion) > 0 ? Number(r.racion) : null;
                      if (!kcal && !tiempo && !raciones) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-bold">
                          {kcal && (
                            <span className="inline-flex items-center gap-1 text-[#FF690B]">
                              <Flame className="w-3.5 h-3.5" /> {kcal}
                            </span>
                          )}
                          {tiempo && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5" /> {tiempo}
                            </span>
                          )}
                          {raciones && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Users className="w-3.5 h-3.5" /> {raciones}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-transparent flex flex-col pt-8 pl-8 pr-12 pb-12">
        <div className="w-full flex items-center mb-6">
          <Link href="/panel-cocina" className="flex items-center gap-3 text-[#363C98] hover:opacity-80 transition-opacity cursor-pointer">
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            <h1 className="text-3xl font-bold">Volver a Cocina</h1>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <span className="text-5xl">📚</span>
          <p className="text-[#363C98] font-semibold text-xl">{error}</p>
          <Link href="/panel-cocina">
            <button className="mt-4 bg-[#363C98] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#363C98]/90 transition-colors cursor-pointer">
              Volver a la biblioteca
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent flex flex-col pt-8 pl-8 pr-12 pb-12 animate-in fade-in duration-300">
      
      {/* Header outside the box */}
      <div className="w-full flex flex-col gap-2 mb-6">
        {isFreeSample && <FreeSampleBadge className="self-start" />}
        <Link href="/panel-cocina" className="flex items-center gap-3 text-[#363C98] hover:opacity-80 transition-opacity cursor-pointer">
          <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
          <h1 className="text-3xl font-bold">
            {bookTitle}
            {versionTitle ? <span className="font-normal text-2xl"> ( {versionTitle} )</span> : null}
          </h1>
        </Link>
      </div>

      {/* Main Gray Container */}
      <div className="flex-1 w-full bg-[#F9F9F9] rounded-[30px] p-6 md:p-10 relative flex flex-col items-center shadow-sm">
        
        {/* Top Right Icons */}
        <div className="absolute top-6 right-8 flex items-center gap-6 z-10">
          <button className="text-[#363C98] hover:opacity-80 transition-opacity cursor-pointer">
            <LinkIcon className="w-7 h-7" strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Menu className="w-9 h-9" strokeWidth={3} />
          </button>
        </div>

        {/* PDF Viewer — a este punto `pdfFile` siempre tiene valor: toda rama de
            loadBook() que no consigue una URL de PDF llama a setError(...) y
            corta el render con la pantalla de error de arriba (nunca llega
            aquí sin PDF). Antes había un texto de repuesto para "sin PDF" en
            este mismo sitio que, por eso, no se podía ver nunca. */}
        <div className="relative bg-white shadow-xl mt-4 flex flex-col items-center justify-center min-h-[600px] overflow-hidden rounded-md w-full">
          <PdfViewer
            file={pdfFile}
            pageNumber={pageNumber}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
          />
          <p className="absolute bottom-4 right-4 text-sm text-gray-400 bg-white/80 px-2 py-1 rounded">
            Página {pageNumber} de {numPages || '--'}
          </p>
        </div>

        {/* Pagination Controls */}
        {pdfFile && (
          <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between items-center text-[#FF690B] font-medium text-lg">
            <button 
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className={`flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer border-b border-[#FF690B] pb-0.5 ${pageNumber <= 1 ? 'opacity-50 cursor-not-allowed border-transparent' : ''}`}
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            <button 
              onClick={nextPage}
              disabled={numPages ? pageNumber >= numPages : true}
              className={`flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer border-b border-[#FF690B] pb-0.5 ${(numPages && pageNumber >= numPages) ? 'opacity-50 cursor-not-allowed border-transparent' : ''}`}
            >
              Siguiente <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>

      <BookIndexSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={indexes}
        activePage={pageNumber}
        onItemClick={goToPage}
      />

      <style jsx global>{`
        .pdf-page-container canvas {
           max-width: 100% !important;
           height: auto !important;
        }
      `}</style>
    </div>
  );
}
