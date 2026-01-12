"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useRouter } from 'next/navigation';


import { useAuthStore } from "@/stores/auth.store";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

export default function TopVentas() {
  const { logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleLogoutConfirmed = () => {
    logout();
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <div>
      <div className="flex items-center justify-between w-full pr-8">
        <h2 className="text-secondary font-bold text-4xl">Nuestros top ventas</h2>
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3932C0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icon-tabler-logout"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
            <path d="M9 12h12l-3 -3" />
            <path d="M18 15l3 -3" />
          </svg>
        </div>
      </div>

      <div className="slider-container mt-20 overflow-hidden max-w-full mx-auto">
        <Slider {...settings}>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

        </Slider>
      </div>

      <div className="mt-10">

        <h2 className="text-secondary font-bold text-4xl">
          Continua donde estabas
        </h2>
        <div className="slider-container mt-20 overflow-hidden max-w-full mx-auto">
        <Slider {...settings}>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

          <div className="min-w-0 px-3">
            <div className="text-center rounded-lg max-w-[320px] w-full mx-auto p-6 shadow-md flex flex-col items-center justify-center space-y-4">
              <div className="w-full flex justify-center">
                <Image src="/group32.png" width={240} height={240} alt="imagen" className="object-contain" />
              </div>
              <p className="text-primary font-bold text-2xl">La Cocina Squat Fit - Vol.1</p>
              <p className="text-secondary text-2xl">Libro</p>
            </div>
          </div>

        </Slider>
      </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogoutConfirmed}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />
    </div>
  );
}
