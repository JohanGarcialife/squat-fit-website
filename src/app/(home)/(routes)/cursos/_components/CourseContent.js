'use client'
import React from "react";
import Image from "next/image";
import useWindowSize from "@/hooks/UseWindowSize";

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
            Qué incluye el curso
          </h2>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <Image
                src="/icons/movie_edit.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Clases en vídeo</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                  24+ horas de clases prácticas y 3 horas de clases teóricas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Image
                src="/icons/chat_info.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Soporte</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                 Atención 24/7 para las preguntas que tengas acerca del curso.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <Image
                src="/icons/edit_document.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Apuntes</p>
                <p className=" text-2xl text-black max-w-[273px] ">              
Material de apoyo con fines de repasar el contenido
                </p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <Image
                src="/icons/contract_edit.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Ponte a prueba</p>
                <p className=" text-2xl text-black max-w-[273px] mb-6">
                  Al final harás un examen para obtener tu diploma
                </p>
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
            Qué incluye el curso
          </h2>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <Image
                src="/icons/movie_edit.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Clases en vídeo</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                  24+ horas de clases prácticas y 3 horas de clases teóricas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Image
                src="/icons/chat_info.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Soporte</p>
                <p className=" text-2xl text-black max-w-[273px] ">
                 Atención 24/7 para las preguntas que tengas acerca del curso.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <Image
                src="/icons/edit_document.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Apuntes</p>
                <p className=" text-2xl text-black max-w-[273px] ">              
Material de apoyo con fines de repasar el contenido
                </p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <Image
                src="/icons/contract_edit.png"
                alt="Icon"
                width={52}
                height={52}
                priority
              />
              <div>
                <p className="text-3xl text-black font-bold">Ponte a prueba</p>
                <p className=" text-2xl text-black max-w-[273px] mb-6">
                  Al final harás un examen para obtener tu diploma
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
