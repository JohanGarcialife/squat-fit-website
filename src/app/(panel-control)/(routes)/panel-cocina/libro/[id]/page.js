"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Link as LinkIcon, Menu } from "lucide-react";
import { BookIndexSidebar } from "@/app/(panel-control)/(routes)/panel-control/_components/Sidebar";
import { useAuthStore } from "@/stores/auth.store";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://squatfit-api-cyrc2g3zra-no.a.run.app';

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

// Dynamically import the PdfViewer so it doesn't run on the server
const PdfViewer = dynamic(() => import("./_components/PdfViewer"), { ssr: false });

export default function BookReaderPage({ params, searchParams }) {
  const { id: bookId } = React.use(params);
  const resolvedSearch = React.use(searchParams);
  const versionId = resolvedSearch?.v || null;

  const { token } = useAuthStore();
  
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

        setBookTitle(bookData.title || 'Cocina Squat Fit');

        // Buscar la versión específica en la respuesta
        const version = bookData.versions?.find(v =>
          v.version_id === versionId || v.id === versionId
        ) || bookData.versions?.[0];

        console.log("Versión de libro seleccionada:", version);

        if (version) {
          setVersionTitle(version.version_title || version.title || '');

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
        console.error('Error al cargar el libro:', err);
        setError('Ocurrió un error al cargar el libro. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId, versionId, token]);

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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-transparent flex items-center justify-center pt-8 pl-8 pr-12 pb-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3932C0]"></div>
          <p className="text-[#3932C0] font-semibold text-lg">Cargando lector...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-transparent flex flex-col pt-8 pl-8 pr-12 pb-12">
        <div className="w-full flex items-center mb-6">
          <Link href="/panel-cocina" className="flex items-center gap-3 text-[#3932C0] hover:opacity-80 transition-opacity cursor-pointer">
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            <h1 className="text-3xl font-bold">Volver a Cocina</h1>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <span className="text-5xl">📚</span>
          <p className="text-[#3932C0] font-semibold text-xl">{error}</p>
          <Link href="/panel-cocina">
            <button className="mt-4 bg-[#3932C0] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#3932C0]/90 transition-colors cursor-pointer">
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
      <div className="w-full flex items-center mb-6">
        <Link href="/panel-cocina" className="flex items-center gap-3 text-[#3932C0] hover:opacity-80 transition-opacity cursor-pointer">
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
          <button className="text-[#3932C0] hover:opacity-80 transition-opacity cursor-pointer">
            <LinkIcon className="w-7 h-7" strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Menu className="w-9 h-9" strokeWidth={3} />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="relative bg-white shadow-xl mt-4 flex flex-col items-center justify-center min-h-[600px] overflow-hidden rounded-md w-full">
          {pdfFile ? (
            <>
              <PdfViewer 
                file={pdfFile}
                pageNumber={pageNumber}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
              />
              <p className="absolute bottom-4 right-4 text-sm text-gray-400 bg-white/80 px-2 py-1 rounded">
                Página {pageNumber} de {numPages || '--'}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <span className="text-4xl">📄</span>
              <p className="text-gray-400 font-medium">El PDF de este libro aún no está disponible.</p>
            </div>
          )}
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
