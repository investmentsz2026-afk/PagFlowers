'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after scroll down slightly
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(true); // Keep it visible for ease of access but could toggle
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Run on mount
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
  const message = encodeURIComponent('Hola RossyFlowers, vengo de la web y me gustaría hacer una consulta sobre sus arreglos florales exclusivos.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-green-300 print:hidden"
      aria-label="Contactar por WhatsApp"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      {/* Dynamic Pulse Ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping -z-10 group-hover:animate-none"></span>
      
      <MessageCircle size={28} className="fill-current" />
      
      {/* Luxury Tooltip */}
      <span className="absolute right-20 bg-luxury-black text-gold-200 text-xs py-2 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gold-400/20 font-sans tracking-wide">
        ¿Consultas? Escríbenos por WhatsApp
      </span>
    </a>
  );
}
