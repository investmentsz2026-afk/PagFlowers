'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alessandra De la Fuente',
    district: 'San Isidro',
    initials: 'AD',
    text: 'La delicadeza de los arreglos florales es insuperable. Compré la Caja Hexagonal Dorada y mi madre quedó completamente fascinada. El servicio fotográfico previo al envío me dio muchísima seguridad. ¡La mejor florería de Lima sin duda!',
    stars: 5,
  },
  {
    name: 'Giancarlo Barbieri',
    district: 'Miraflores',
    initials: 'GB',
    text: 'Impresionante nivel de servicio. Hice un pedido de orquídeas blancas a última hora de la mañana y lo entregaron a las 3 PM impecable, tal cual las fotos. Las dedicatorias en la tarjeta premium con sello de cera le dan un toque increíble.',
    stars: 5,
  },
  {
    name: 'Mariana Prado',
    district: 'La Molina',
    initials: 'MP',
    text: 'Los ramos de rosas en tonos pastel son una obra de arte. Se nota el cuidado y el diseño florístico detrás. El proceso de compra fue rapidísimo, y el botón directo a WhatsApp para coordinar el pago y envío por Yape funciona de maravilla.',
    stars: 5,
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="relative glass-card max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl overflow-hidden mt-10">
      <Quote size={64} className="absolute -top-4 -left-4 text-gold-200/20 stroke-[1]" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          {/* Stars */}
          <div className="flex justify-center gap-1">
            {[...Array(testimonials[current].stars)].map((_, i) => (
              <Star key={i} size={18} className="fill-gold-400 text-gold-400" />
            ))}
          </div>

          {/* Testimonial text */}
          <p className="font-serif text-base sm:text-lg italic text-luxury-black/80 leading-relaxed max-w-2xl mx-auto">
            "{testimonials[current].text}"
          </p>

          {/* Customer Avatar & Name */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center font-sans font-bold text-gold-700 text-sm">
              {testimonials[current].initials}
            </div>
            <div className="text-left">
              <h4 className="font-sans text-sm font-semibold text-luxury-black">{testimonials[current].name}</h4>
              <p className="font-sans text-[11px] uppercase tracking-wider text-gold-600 font-medium">
                Cliente de {testimonials[current].district}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          className="p-2 border border-gold-400/20 rounded-full hover:bg-gold-100/50 text-luxury-black transition-colors"
          aria-label="Testimonio anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          className="p-2 border border-gold-400/20 rounded-full hover:bg-gold-100/50 text-luxury-black transition-colors"
          aria-label="Siguiente testimonio"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
