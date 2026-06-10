'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 7000); // 7s auto-scroll
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative h-[90vh] sm:h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* Slider Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out transform-gpu will-change-transform scale-105"
            style={{
              backgroundImage: `url(${banners[current].image})`,
            }}
          />
          {/* Luxury dark overlay with a golden tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/75 to-transparent" />

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center pt-20 sm:pt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-left space-y-6">
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-sans text-xs tracking-[0.4em] uppercase text-gold-400 block font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  RossyFlowers • Lima
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif text-5xl sm:text-7xl font-bold uppercase tracking-wider text-white leading-none [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]"
                >
                  {banners[current].title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="font-sans text-sm sm:text-lg text-white/90 leading-relaxed max-w-xl font-light [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]"
                >
                  {banners[current].subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="pt-6"
                >
                  <Link
                    href={banners[current].link}
                    className="inline-flex items-center justify-center px-10 py-4.5 bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-semibold text-xs tracking-widest uppercase hover:bg-gold-400 hover:text-white transition-all duration-300 rounded shadow-2xl hover:scale-105 active:scale-95 duration-500 border border-transparent hover:border-gold-300"
                  >
                    {banners[current].buttonText}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/30 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block"
        aria-label="Anterior slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/30 text-white hover:bg-gold-400 hover:text-luxury-black transition-all focus:outline-none hidden sm:block"
        aria-label="Siguiente slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
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
    </div>
  );
}
