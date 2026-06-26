'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
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

  return (
    <div className="relative h-[90vh] sm:h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* Slider Track */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${banner.image})`,
              }}
            />
            {/* Luxury dark overlay with a golden tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/75 to-transparent" />

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center pt-20 sm:pt-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-left space-y-6">
                  <span className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 block font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                    RossyFlowers • Lima
                  </span>
                  <h1 className="font-serif text-5xl sm:text-7xl font-bold uppercase tracking-wider text-white leading-none [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                    {banner.title}
                  </h1>
                  <p className="font-sans text-sm sm:text-lg text-white/90 leading-relaxed max-w-xl font-light [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                    {banner.subtitle}
                  </p>
                  <div className="pt-6">
                    <Link
                      href={banner.link}
                      className="inline-flex items-center justify-center px-10 py-4.5 bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-semibold text-xs tracking-widest uppercase hover:bg-gold-400 hover:text-white transition-all duration-300 rounded shadow-2xl hover:scale-105 active:scale-95 duration-500 border border-transparent hover:border-gold-300"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/30 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block z-20"
            aria-label="Anterior slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/30 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block z-20"
            aria-label="Siguiente slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === current ? 'bg-gold-400 w-8' : 'bg-white/40'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
