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
  image: string;
  link: string;
  imageFit?: 'contain' | 'cover';
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

  // Make sure current doesn't exceed banners length if slides changed
  const safeCurrent = current >= banners.length ? 0 : current;

  return (
    <div className="relative min-h-[620px] sm:min-h-[680px] lg:min-h-[640px] h-[92vh] sm:h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* Slider Track */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${safeCurrent * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const isCover = banner.imageFit === 'cover';

          return (
            <div key={banner.id ?? index} className="w-full h-full flex-shrink-0 relative overflow-hidden flex items-center">
              {isCover ? (
                /* Full Cover Mode */
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${banner.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/75 to-transparent" />
                  
                  <div className="relative z-10 w-full flex items-center pt-20 sm:pt-28 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="max-w-2xl text-left space-y-5 sm:space-y-6">
                        <span className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 block font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                          {banner.tag || 'RossyFlowers • Lima'}
                        </span>
                        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-wider text-white leading-tight sm:leading-none [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
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
                    </div>
                  </div>
                </>
              ) : (
                /* Responsive Adapted Mode (Default - Complete Image, Never Huge or Cropped) */
                <>
                  {/* Ambient blurred glow from image colors */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-700"
                    style={{ backgroundImage: `url(${banner.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 lg:via-[#0D0D0D]/75 to-[#0D0D0D]/50 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-[#0D0D0D]/60 pointer-events-none" />

                  {/* Slide Content Grid */}
                  <div className="relative z-10 w-full h-full flex items-center pt-20 sm:pt-24 lg:pt-20 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                        
                        {/* Text Information Column */}
                        <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6 order-2 lg:order-1">
                          <span className="font-sans text-[11px] sm:text-xs tracking-[0.35em] uppercase text-gold-400 block font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                            {banner.tag || 'RossyFlowers • Lima'}
                          </span>
                          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-white leading-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
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

                        {/* Complete & Responsive Image Column */}
                        <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
                          <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-none flex items-center justify-center">
                            {/* Decorative ambient aura */}
                            <div className="absolute inset-0 bg-gold-400/10 rounded-3xl blur-2xl transform scale-90 pointer-events-none" />
                            
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="relative z-10 max-h-[30vh] sm:max-h-[44vh] lg:max-h-[66vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] border border-gold-400/20 transition-transform duration-500 hover:scale-[1.02]"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </>
              )}
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
