'use client'
import React from "react";
import Image from "next/image";
import useWindowSize from "@/hooks/UseWindowSize";
import FeatureIcon from "@/app/components/FeatureIcon";
import { Salad, Lightbulb, BadgePercent, Soup } from "lucide-react";

export default function CourseContent() {
   const { width } = useWindowSize();
  return (
    <div className=" px-3 md:px-14">
      {width > 768 ?<div className="relative w-full  min-h-[550px]">
        <Image
          src="/Rectangle.png"
          alt="Background Image"
          fill
          className="object-fit"
          quality={75}
          priority
        />

        <div className="absolute inset-0 z-10 grid grid-cols-3 p-20 w-full gap-14">
          <h2 className="text-6xl font-bold text-black pr-24">
            Qué incluye el libro
          </h2>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <FeatureIcon icon={Salad} />
              <div>
                <p className="text-3xl text-black font-bold">Rico y saludable</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                  +70 recetas ricas con sustituciones y adaptaciones.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FeatureIcon icon={Lightbulb} />
              <div>
                <p className="text-3xl text-black font-bold">Didáctico</p>
                <p className=" text-2xl text-black max-w-[273px] ">
 Consejos de alimentos a elegir a la hora de hacer la compra.                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <FeatureIcon icon={BadgePercent} />
              <div>
                <p className="text-3xl text-black font-bold">Navegación fácil</p>
                <p className=" text-2xl text-black max-w-[273px] ">              

Con descuentos en suplementos e ingredientes top.
                </p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <FeatureIcon icon={Soup} />
              <div>
                <p className="text-3xl text-black font-bold">Recetas saciantes</p>
                <p className=" text-2xl text-black max-w-[273px] mb-6">
 Raciones grandes que te dejarán lleno y satisfecho.                </p>
              </div>
            </div>
          </div>
        </div>
      </div> : 
      
      <div className="relative w-full min-h-[1176px] md:min-h-[550px]">
        <Image
          src="/Rectangle30.png"
          alt="Background Image"
          fill
          className="object-fit"
          quality={75}
          priority
        />

        <div className="absolute inset-0 z-10 grid md:grid-cols-3 grid-cols-1  p-10 md:p-20 w-full gap-16 md:gap-14">
          <h2 className="text-5xl pt-16 md:pt-0 text-center md:text-start md:text-6xl font-bold text-black md:pr-24">
            Qué incluye el libro
          </h2>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <FeatureIcon icon={Salad} />
              <div>
                <p className="text-3xl text-black font-bold">Rico y saludable</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                  +70 recetas ricas con sustituciones y adaptaciones.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FeatureIcon icon={Lightbulb} />
              <div>
                <p className="text-3xl text-black font-bold">Didáctico</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                 Consejos de alimentos a elegir a la hora de hacer la compra.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <FeatureIcon icon={BadgePercent} />
              <div>
                <p className="text-3xl text-black font-bold">Navegación fácil</p>
                <p className=" text-2xl text-black max-w-[273px] ">
Con descuentos en suplementos e ingredientes top.
                </p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <FeatureIcon icon={Soup} />
              <div>
                <p className="text-3xl text-black font-bold">Recetas saciantes</p>
                <p className=" text-2xl text-black max-w-[273px] mb-6">
                  Raciones grandes que te dejarán lleno y satisfecho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
