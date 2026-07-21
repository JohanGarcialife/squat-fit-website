"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { BookOpen, Lock, ArrowRight } from "lucide-react";
import RichProductCards from "@/app/components/RichProductCards";
import AccessNotice from "@/app/components/AccessNotice";
import { handleApiError } from "@/app/components/handleApiError";

export default function CocinaPage() {
  const { token, isSubscribed } = useAuthStore();
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
    if (token) {
      if (isSubscribed) {
        fetchBooks();
      } else {
        setBooks([]);
        setLoading(false);
      }
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

  // Sin sesión: aviso de acceso (como el resto del panel), no la tienda.
  if (!token) return <AccessNotice redirect="/panel-cocina" />;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 min-h-screen">

      {/* Title */}
      <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Cocina</h1>

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

                 <Link href={`/panel-cocina/libro/${item.bookId}?v=${item.versionId}`}>
                   <button className="bg-[#3932C0] text-white font-bold py-3 px-12 rounded-xl text-lg hover:bg-[#3932C0]/90 transition-colors shadow-lg cursor-pointer">
                      {item.buttonText || 'Ver mi libro'}
                   </button>
                 </Link>
            </div>
          ))}

        </div>
      ) : (
        /* --- Pantalla de Sin Suscripción Activa (Tarjetas Enriquecidas) --- */
        <div className="py-12">
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
