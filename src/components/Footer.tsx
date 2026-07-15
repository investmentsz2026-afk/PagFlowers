'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Award, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#0D0D0D] text-[#A6A6A6] font-sans border-t border-gold-800/20 print:hidden">
      {/* 1. Value Proposition Banner */}
      <div className="border-b border-gold-800/10 py-12 px-4 bg-[#1A1A1A]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <Award className="text-gold-400 mt-1 flex-shrink-0" size={32} />
            <div>
              <h4 className="font-serif text-gold-200 text-sm tracking-widest uppercase mb-1">Calidad de Autor</h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                Nuestros arreglos son diseñados por floristas galardonados con flores 100% frescas importadas diariamente.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-gold-400 mt-1 flex-shrink-0" size={32} />
            <div>
              <h4 className="font-serif text-gold-200 text-sm tracking-widest uppercase mb-1">Garantía RossyFlowers</h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                Cuidado al detalle, empaque premium acolchado y confirmación fotográfica antes del despacho.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="text-gold-400 mt-1 flex-shrink-0" size={32} />
            <div>
              <h4 className="font-serif text-gold-200 text-sm tracking-widest uppercase mb-1">Envío Express en Lima</h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                Entregas programadas en rangos de 2 horas. Envíos el mismo día para pedidos hasta las 4:00 PM.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About & Branding */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl tracking-widest text-white">
            Rossy<span className="text-gold-400 font-light text-base tracking-normal">Flowers</span>
          </h3>
          <p className="text-xs leading-relaxed text-[#8C8C8C]">
            La florería boutique líder en Lima, especializada en momentos especiales y diseño floral contemporáneo de lujo. Redefiniendo el arte de regalar emociones.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            {/* Visual Payment Badges */}
            <span className="px-2 py-1 bg-[#1A1A1A] text-[9px] text-gold-300 border border-gold-800/30 rounded font-semibold tracking-wider">VISA</span>
            <span className="px-2 py-1 bg-[#1A1A1A] text-[9px] text-gold-300 border border-gold-800/30 rounded font-semibold tracking-wider">MC</span>
            <span className="px-2 py-1 bg-[#1A1A1A] text-[9px] text-gold-300 border border-gold-800/30 rounded font-semibold tracking-wider">AMEX</span>
            <span className="px-2 py-1 bg-[#1A1A1A] text-[9px] text-gold-300 border border-gold-800/30 rounded font-semibold tracking-wider">YAPE</span>
            <span className="px-2 py-1 bg-[#1A1A1A] text-[9px] text-gold-300 border border-gold-800/30 rounded font-semibold tracking-wider">PLIN</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-sm tracking-widest text-gold-400 uppercase mb-6">Colecciones</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link href="/catalog?category=Cajas+de+Lujo" className="hover:text-gold-400 transition-colors">Cajas de Rosas Exclusivas</Link>
            </li>
            <li>
              <Link href="/catalog?category=Orqu%C3%ADdeas" className="hover:text-gold-400 transition-colors">Orquídeas Imperiales</Link>
            </li>
            <li>
              <Link href="/catalog?category=Ramos" className="hover:text-gold-400 transition-colors">Bouquets de Temporada</Link>
            </li>
            <li>
              <Link href="/catalog?category=Detalles+Especiales" className="hover:text-gold-400 transition-colors">Detalles y Regalos Premium</Link>
            </li>
          </ul>
        </div>

        {/* Delivery Coverage */}
        <div>
          <h4 className="font-serif text-sm tracking-widest text-gold-400 uppercase mb-6">Cobertura en Lima</h4>
          <p className="text-xs text-[#8C8C8C] mb-4 leading-relaxed">
            Realizamos despachos en distritos clave de Lima Metropolitana con tarifas personalizadas:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-[11px] text-[#8C8C8C]">
            <li>• Miraflores</li>
            <li>• San Isidro</li>
            <li>• S. de Surco</li>
            <li>• La Molina</li>
            <li>• San Borja</li>
            <li>• Barranco</li>
            <li>• Chorrillos</li>
            <li>• San Miguel</li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm tracking-widest text-gold-400 uppercase mb-6">Atención al Cliente</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-gold-400 flex-shrink-0" />
              <span>Calle Monte Real 110, La Molina, Lima</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-gold-400 flex-shrink-0" />
              <span>+51 914 060 876</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gold-400 flex-shrink-0" />
              <span>pedidos@rossyflowers.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Credits */}
      <div className="border-t border-gold-800/10 py-6 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#6E6E6E]">
          <p>© {currentYear} ROSSYFLOWERS S.A.C. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/admin/login" className="hover:text-gold-400 transition-colors">CPanel de Control</Link>
            <span className="cursor-default">Lima, Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
