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

              {/* 2. Light Luxury Gradient Overlay: Keeps background bright and clear while protecting text readability on the left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/75 via-[#0D0D0D]/35 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/35 via-transparent to-[#0D0D0D]/15 pointer-events-none" />

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

                    {/* Right: Featured Arrangement Card (Adapts tightly to image proportions with a delicate thin border and smaller footprint) */}
                    <div className="lg:col-span-6 flex items-center justify-center lg:justify-end order-1 lg:order-2">
                      <div className="relative inline-flex items-center justify-center">
                        {/* Soft golden halo glow conforming to image bounds */}
                        <div className="absolute inset-0 bg-gold-400/10 rounded-2xl blur-xl transform scale-95 pointer-events-none" />
                        
                        {/* The Image Card: inline-flex, hugs image tightly without excess horizontal dark margins */}
                        <div className="relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] border border-white/20 p-1 sm:p-1.5 bg-black/25 backdrop-blur-xs group transition-transform duration-500 hover:scale-[1.01]">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="max-h-[32vh] sm:max-h-[44vh] lg:max-h-[64vh] w-auto max-w-full object-contain rounded-xl select-none"
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
