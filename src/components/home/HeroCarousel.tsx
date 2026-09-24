'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Banner {
  id: number | string;
  tag?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;       // Foto del arreglo (cuadro destacado)
  bgImage?: string;   // Foto de fondo panorámica (1920x1080)
  link: string;
}

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 7000); // 7s auto-scroll
    return () => clearInterval(timer);
  }, [banners?.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  const safeCurrent = current >= banners.length ? 0 : current;

  return (
    <div className="relative min-h-[640px] sm:min-h-[700px] lg:min-h-[680px] h-[94vh] sm:h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* Slider Track */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${safeCurrent * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const bannerId = banner.id ?? index;

          return (
            <div key={bannerId} className="w-full h-full flex-shrink-0 relative overflow-hidden bg-[#0D0D0D] flex items-center">
              
              {/* 1. Full Background Image Layer */}
              {banner.bgImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                  style={{ backgroundImage: `url(${banner.bgImage})` }}
                />
              ) : (
                /* Ambient glow fallback from the flower image if no custom background is uploaded */
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 transition-all duration-700 pointer-events-none"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
              )}

              {/* 2. Luxury Dark Gradient Overlay: Keeps text and featured card ultra legible */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/80 lg:via-[#0D0D0D]/65 to-[#0D0D0D]/35 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]/50 pointer-events-none" />

              {/* 3. Slide Content (Two Columns) */}
              <div className="relative z-10 w-full h-full flex items-center pt-24 sm:pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* Left: Text Information (6 cols) */}
                    <div className="lg:col-span-6 text-left space-y-5 sm:space-y-6 order-2 lg:order-1">
                      <span className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 block font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                        {banner.tag || 'RossyFlowers • Lima'}
                      </span>
                      <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-wider text-white leading-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                        {banner.title}
                      </h1>
                      <p className="font-sans text-xs sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl font-light [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                        {banner.subtitle}
                      </p>
                      <div className="pt-2 sm:pt-4">
                        <Link
                          href={banner.link || '/catalog'}
                          className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-semibold text-xs tracking-widest uppercase hover:bg-gold-400 hover:text-white transition-all duration-300 rounded shadow-2xl hover:scale-105 active:scale-95 duration-500 border border-transparent hover:border-gold-300 cursor-pointer"
                        >
                          {banner.buttonText || 'Ver Colección Premium'}
                        </Link>
                      </div>
                    </div>

                    {/* Right: Featured Arrangement Card (6 cols) - LARGER ("cuadrito más grande") */}
                    <div className="lg:col-span-6 flex items-center justify-center lg:justify-end order-1 lg:order-2">
                      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl flex items-center justify-center">
                        {/* Golden halo glow */}
                        <div className="absolute inset-0 bg-gold-400/15 rounded-3xl blur-3xl transform scale-95 pointer-events-none" />
                        
                        {/* The Image Card */}
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] border border-white/10 bg-neutral-900/60 p-2.5 sm:p-3.5 backdrop-blur-md group w-full flex items-center justify-center">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="max-h-[38vh] sm:max-h-[52vh] lg:max-h-[76vh] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Manual Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/40 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block z-30 cursor-pointer backdrop-blur-sm"
            aria-label="Anterior slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/40 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block z-30 cursor-pointer backdrop-blur-sm"
            aria-label="Siguiente slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === safeCurrent ? 'bg-gold-400 w-8' : 'bg-white/40 w-2.5'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
