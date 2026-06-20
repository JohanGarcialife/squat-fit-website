"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { BookOpen, Lock, ArrowRight } from "lucide-react";

export default function CocinaPage() {
  const { token } = useAuthStore();
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

      // Paso 1: verificar suscripción con /book/by-user
      const byUserRes = await axios.get(`${API}/api/v1/book/by-user`, { headers });
      const userBooks = byUserRes.data;

      // Obtener catálogo completo para sanitizar IDs
      const allRes = await axios.get(`${API}/api/v1/book/all`, { headers });
      const allBooks = allRes.data;

      if (Array.isArray(userBooks) && userBooks.length > 0) {
        // Tiene libros asignados directamente → suscripción activa
        useAuthStore.getState().setSubscribed(true);

        // Sanitizar IDs mutados cruzando con allBooks (catálogo confiable)
        const sanitizedUserBooks = userBooks.map(ub => {
          const match = Array.isArray(allBooks) && allBooks.find(ab => 
            ab.title?.toLowerCase() === ub.title?.toLowerCase() ||
            (ab.id && ub.id && ab.id.split('-').slice(2).join('-') === ub.id.split('-').slice(2).join('-'))
          );
          if (match) {
            return { ...ub, id: match.id };
          }
          return ub;
        });

        setBooks(sanitizedUserBooks);
      } else {
        // Sin suscripción activa
        useAuthStore.getState().setSubscribed(false);
        setBooks([]);
      }
    } catch (error) {
      console.error("Error al obtener libros:", error);
      useAuthStore.getState().setSubscribed(false);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBooks();
    else setLoading(false);
  }, [token]);

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

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
      
      {/* Title */}
      <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Cocina</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
        </div>
      ) : ownedVersions.length > 0 ? (
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
        /* --- Pantalla de Sin Suscripción Activa --- */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Icono de bloqueo */}
          <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
            <Lock size={44} className="text-indigo-300" strokeWidth={1.5} />
          </div>

          <h2 className="text-[#3932C0] text-3xl font-bold mb-4">
            Aún no tienes acceso a la biblioteca
          </h2>
          <p className="text-gray-500 text-lg max-w-md mb-10 leading-relaxed">
            Suscríbete a la <strong>Biblioteca Digital de Squat Fit</strong> para acceder a todas las recetas y contenido exclusivo de cocina fit.
          </p>

          {/* Preview de lo que tendrán */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-sm">
            <div className="flex-1 bg-indigo-50 rounded-2xl p-4 text-center">
              <BookOpen size={28} className="text-indigo-700 mx-auto mb-2" />
              <p className="text-indigo-900 font-bold text-sm">Libros digitales Vol. 1 y 2</p>
            </div>
            <div className="flex-1 bg-orange-50 rounded-2xl p-4 text-center">
              <span className="text-2xl">🥗</span>
              <p className="text-orange-700 font-bold text-sm mt-1">+100 recetas fit</p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link href="/cocina#shop">
              <button className="flex items-center justify-center gap-3 bg-[#3932C0] text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-[#3932C0]/90 transition-all shadow-xl shadow-indigo-200 cursor-pointer group">
                Ver planes de suscripción
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <button 
              onClick={() => {
                setLoading(true);
                fetchBooks();
              }}
              className="flex items-center justify-center gap-3 bg-white text-[#3932C0] border-2 border-[#3932C0] font-bold py-4 px-10 rounded-2xl text-lg hover:bg-gray-50 transition-all cursor-pointer shadow-md"
            >
              🔄 Verificar mi pago / acceso
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Desde 9,99€/mes • Cancela cuando quieras
          </p>
        </div>
      )}

    </div>
  );
}
