"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useRouter } from 'next/navigation';

import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useUiStore } from "@/stores/ui.store";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import usePreloadImages from "@/hooks/usePreloadImages";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Portadas nuevas (mapeo 6.4): si el título del curso coincide con un
// producto conocido, se usa la portada local; si no, la imagen del backend.
const LOCAL_COVERS = [
  { match: /cocina/i, src: '/mockup_cocina.png' },
  { match: /fuerte|definid/i, src: '/mockup_fuerte_definido.png' },
  { match: /mejor versi|versión|transform/i, src: '/mockup_mejor_version.png' },
  { match: /libro\s*2/i, src: '/Libro2.png' },
  { match: /libro/i, src: '/Libro1.png' },
];

const ALLOWED_HOSTS = ['storage.googleapis.com', 'images.unsplash.com', 'www.google.com', 'images.pexels.com', 'iframe.mediadelivery.net', 'b-cdn.net'];

function coverFor(course) {
  const title = course.name || course.title || '';
  const local = LOCAL_COVERS.find((c) => c.match.test(title));
  if (local) return local.src;
  if (course.image) {
    try {
      const parsedUrl = new URL(course.image);
      const isAllowed = ALLOWED_HOSTS.some((host) =>
        parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
      );
      if (isAllowed) return course.image;
    } catch (error) {
      // URL relativa: Next exige que empiece por '/'
      return course.image.startsWith('/') ? course.image : '/' + course.image;
    }
  }
  return '/Libro1.png';
}

// The Top Sales data is now passed as `courses` prop from the parent


// 'Continua donde estabas' section will be added once course purchase
// and progress tracking are implemented (GET /api/v1/course/by-user)

// Flechas de marca visibles (antes las flechas de slick quedaban escondidas).
const ArrowBtn = ({ onClick, dir }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir === 'next' ? 'Siguiente' : 'Anterior'}
    className={`absolute top-1/2 z-20 -translate-y-1/2 ${dir === 'next' ? 'right-0' : 'left-0'} flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#FF690B] shadow-md ring-1 ring-black/5 transition-transform hover:scale-110 active:scale-95`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'next' ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
    </svg>
  </button>
);

const CarouselSection = ({ title, items, variant = 'default', onItemClick }) => {
  // slidesToShow adaptativo: si hay menos items que columnas, no dejar hueco
  // a un lado (era lo que hacía que se viera "ladeado").
  const perView = Math.min(3, Math.max(1, items.length));
  // Solo tiene sentido centrar (y hacer loop) cuando hay más items que columnas.
  // Con centerMode, el slide activo/seleccionado queda CENTRADO (como el resto de
  // carruseles); antes, sin él, `focusOnSelect` mandaba el elegido al lateral.
  const canScroll = items.length > perView;
  const settings = {
    dots: true,
    infinite: canScroll,
    speed: 500,
    slidesToShow: perView,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: canScroll,
    centerPadding: '0px',
    arrows: items.length > 1,
    nextArrow: <ArrowBtn dir="next" />,
    prevArrow: <ArrowBtn dir="prev" />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, items.length), centerMode: items.length > Math.min(2, items.length), centerPadding: '0px' } },
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false, centerMode: items.length > 1, centerPadding: '32px' } },
    ],
  };

  return (
    <div className="mb-16">
      <h2 className="text-[#3932C0] font-bold text-3xl mb-8">{title}</h2>
      <div className="slider-container relative max-w-full mx-auto px-2">
        <Slider {...settings}>
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onItemClick && onItemClick(item.id)}
              className="px-3 pb-8 pt-2 cursor-pointer hover:scale-[1.03] transition-all duration-300"
            > {/* Added padding for shadow and transition */}
              {variant === 'progress' ? (
                 // --- Progress Card Variant ---
                 <div className="flex flex-col space-y-3">
                    <div className="bg-[#FFF6F0] rounded-[20px] shadow-md hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden flex flex-col justify-between">
                        <div className="w-full aspect-square relative">
                            <Image src={item.image} fill alt={item.title} className="object-cover rounded-t-[20px]" />
                        </div>
                        <div className="text-center p-6 flex-grow flex flex-col justify-center">
                            <p className="text-[#FF690B] font-bold text-xl mb-1">{item.title}</p>
                            <p className="text-[#3932C0] text-lg font-medium">{item.subtitle}</p>
                        </div>
                    </div>
                    {/* Progress Bar Outside Card */}
                    <div className="flex items-center space-x-3 px-1">
                        <span className="text-[#FF690B] font-bold text-lg">{item.progress}%</span>
                        <div className="w-full bg-[#FFF6F0] rounded-full h-4">
                            <div 
                                className="bg-[#FF690B] h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                    </div>
                 </div>
              ) : (
                // --- Default Card Variant ---
                <div className="bg-white rounded-[20px] shadow-md hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden flex flex-col justify-between">
                    <div className="w-full aspect-square relative">
                        <Image src={item.image} fill alt={item.title} className="object-cover rounded-t-[20px]" />
                    </div>
                    <div className="text-center p-6 flex-grow flex flex-col justify-center">
                        <p className="text-[#FF690B] font-bold text-xl mb-1">{item.title}</p>
                        <p className="text-[#3932C0] text-lg font-medium">{item.subtitle}</p>
                    </div>
                </div>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default function TopVentas({ courses = [], userCourses = [] }) {
  const { logout } = useAuthStore();
  const { cart } = useCartStore();
  const { openCart } = useUiStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  usePreloadImages(courses.map((c) => c.image).filter(Boolean));

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? cart.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0;

  const handleCourseClick = (courseId) => {
    router.push(`/panel-cursos?id=${courseId}`);
  };

  const handleLogoutConfirmed = () => {
    logout();
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-4">
      {/* Header with Cart and Title is handled here effectively as the page title section */}
      
      {/* 
          NOTE: The reference image shows a Header with just the Title "Nuestros top ventas" 
          and a Cart Icon on the right. 
          The actual component structure might expect the Header to be separate but 
          TopVentas seems to occupy the main slot. 
          I will render the header row HERE for simplicity as per current structure.
      */}
      
      <div className="flex items-center justify-between w-full mb-8">
        {/* Title is rendered inside the first CarouselSection? 
            Actually, the image has "Nuestros top ventas" as the section title. 
            The Header seems to be global. 
            Let's put the Cart Icon here at top right relative to the main content area.
        */}
        <div className="flex-grow"></div> {/* Spacer */}
        <div className="flex items-center space-x-6">
             <div onClick={() => setIsModalOpen(true)} title="Cerrar sesión" className="cursor-pointer text-[#3932C0] hover:text-[#FF690B] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                </svg>
             </div>
             
              {/* Cart Icon */}
             <div
               onClick={openCart}
               className="relative cursor-pointer text-[#3932C0] hover:text-[#FF690B] transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M17 17h-11v-14h-2" />
                    <path d="M6 5l14 1l-1 7h-13" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF690B] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in scale-in duration-200">
                      {totalItems}
                  </span>
                )}
             </div>
        </div>
      </div>

      <CarouselSection 
        title="Nuestros top ventas" 
        items={courses.map(course => ({
          id: course.id,
          title: course.name || course.title,
          subtitle: course.category || "Curso",
          image: coverFor(course)
        }))}
        onItemClick={handleCourseClick}
      />
      
      {/* 'Continua donde estabas' — solo si hay algún curso ya iniciado */}
      {userCourses.length > 0 && (
      <CarouselSection
        title="Continua donde estabas"
        items={userCourses.map(course => ({
          id: course.id,
          title: course.title || course.name,
          subtitle: course.subtitle || course.category || "Curso",
          image: coverFor(course),
          progress: course.progress || 0
        }))}
        variant="progress"
        onItemClick={handleCourseClick}
      />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirmed}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </div>
  );
}
