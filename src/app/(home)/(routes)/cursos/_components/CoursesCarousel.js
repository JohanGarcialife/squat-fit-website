"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useWindowSize from "@/hooks/UseWindowSize";
import useSlickWrapSpeed from "@/hooks/useSlickWrapSpeed";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const courses = [
  {
    src: "/courses/1.png",
  },
  {
    src: "/courses/2.png",
  },

  {
    src: "/courses/5.png",
  },
  {
    src: "/courses/1.png",
  },
  {
    src: "/courses/2.png",
  },

  {
    src: "/courses/5.png",
  },
];

const CoursesCarousel = () => {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowSize();
  const { speed, onBeforeChange, next, prev } = useSlickWrapSpeed(courses.length, sliderRef);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: isMobile ? 1 : 3, // valor por defecto para pantallas grandes
    speed,
    beforeChange: onBeforeChange,
    arrows: false,

    responsive: [
      /* Breakpoint más pequeño primero */
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "60px",
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
    ],
  };

  return (
    <div className="w-screen py-12 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div>
          <div className="relative">
            {width < 480 ? (
              <Slider {...settings} ref={sliderRef}>
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-3 py-5 "
                    onClick={() =>
                      sliderRef.current && sliderRef.current.slickGoTo(index)
                    }>
                    <Image
                      src={course.src}
                      alt={course.src}
                      width={333}
                      height={563}
                      className="rounded-3xl"
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <Slider {...settings} ref={sliderRef}>
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-3 py-5 "
                    onClick={() =>
                      sliderRef.current && sliderRef.current.slickGoTo(index)
                    }>
                    <Image
                      src={course.src}
                      alt={course.src}
                      width={333}
                      height={563}
                      className="rounded-3xl"
                    />
                  </div>
                ))}
              </Slider>
            )}

            {isMobile ? (
              <div className="flex  items-center justify-between mt-4">
                <button
                  aria-label="Anterior"
                  className="cursor-pointer bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                  onClick={prev}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  aria-label="Siguiente"
                  className="cursor-pointer bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                  onClick={next}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            ) : (
              <>
                <button
                  aria-label="Anterior"
                  className="cursor-pointer absolute top-1/2 left-[-50px] -translate-y-1/2 z-10 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                  onClick={prev}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  aria-label="Siguiente"
                  className="cursor-pointer absolute top-1/2 right-[-50px] -translate-y-1/2 z-10 bg-[#FFEDE0] text-[#FF690B] rounded-full p-1.5 hover:scale-110 active:scale-95 transition-transform duration-200"
                  onClick={next}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesCarousel;
