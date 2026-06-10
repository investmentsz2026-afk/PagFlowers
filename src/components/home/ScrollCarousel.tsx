'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  images: string[];
}

interface ScrollCarouselProps {
  products: Product[];
}

export default function ScrollCarousel({ products }: ScrollCarouselProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  React.useEffect(() => {
    if (carouselRef.current) {
      setScrollRange(carouselRef.current.scrollWidth - window.innerWidth);
    }
    
    const handleResize = () => {
      if (carouselRef.current) {
        setScrollRange(carouselRef.current.scrollWidth - window.innerWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange]);

  // Fallback to static items if not enough products
  const items = products.length >= 4 ? products : [
    { id: 1, name: 'Bouquet de Rosas Rojas', category: 'Ramos Exclusivos', price: 150, images: ['/images/products/bouquet-pasteles.webp'] },
    { id: 2, name: 'Caja Premium', category: 'Cajas de Lujo', price: 200, images: ['/images/products/caja-rosas.webp'] },
    { id: 3, name: 'Orquídea Blanca', category: 'Orquídeas Imperiales', price: 250, images: ['/images/products/orquidea-blanca.webp'] },
    { id: 4, name: 'Combo Especial', category: 'Detalles y Regalos', price: 180, images: ['/images/products/combo-especial.webp'] },
    { id: 5, name: 'Tulipanes Holandeses', category: 'Ramos Exclusivos', price: 190, images: ['/images/products/bouquet-pasteles.webp'] }
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-blue-950 dark:bg-[#0A0A0A] transition-colors duration-500">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-950/50 via-transparent to-blue-950 dark:from-[#0A0A0A]/50 dark:to-[#0A0A0A] z-10 transition-colors duration-500" />
        
        {/* Title overlay */}
        <div className="absolute top-24 left-4 sm:left-12 lg:left-24 z-20 pointer-events-none">
          <span className="font-sans text-xs tracking-[0.4em] text-gold-400 uppercase font-semibold block mb-2 drop-shadow-sm">Colección Destacada</span>
          <h2 className="font-serif text-4xl sm:text-6xl font-bold uppercase tracking-wider text-white drop-shadow-lg">
            Obras de Arte
          </h2>
        </div>

        <motion.div ref={carouselRef} style={{ x }} className="flex gap-8 px-4 sm:px-12 lg:px-24 pt-16 z-0 w-max">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative h-[50vh] sm:h-[65vh] w-[80vw] sm:w-[400px] lg:w-[500px] rounded-3xl overflow-hidden shrink-0 flex flex-col justify-end p-8 bg-neutral-900 border border-gold-800/20"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ease-out transform-gpu will-change-transform group-hover:scale-110 opacity-70 group-hover:opacity-100"
                style={{ backgroundImage: `url(${item.images[0]})` }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10 space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="space-y-1">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-gold-400 font-bold block">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold uppercase tracking-wide">
                    {item.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <span className="font-serif text-xl sm:text-2xl text-gold-400 font-bold">
                    S/ {item.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/product/${item.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-neutral-950 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Comprar <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
