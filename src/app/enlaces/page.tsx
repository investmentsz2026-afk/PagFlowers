import React from 'react';
import Link from 'next/link';
import { MessageCircle, ShoppingBag, Heart, Handshake, Building2, CalendarCheck, HelpCircle } from 'lucide-react';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Enlaces Rápidos | RossyFlowers',
  description: 'Contáctanos y encuentra enlaces rápidos a nuestros catálogos, atención por WhatsApp, novias y servicios corporativos.',
};

export default async function EnlacesPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51914060876';

  let catalogPdfUrl = '/catalog';
  try {
    const pdfContent = await prisma.content.findUnique({
      where: { key: 'monthly_catalog_pdf' }
    });
    if (pdfContent && pdfContent.value) {
      try {
        catalogPdfUrl = JSON.parse(pdfContent.value);
      } catch (e) {
        catalogPdfUrl = pdfContent.value;
      }
    }
  } catch (e) {
    console.error('Error fetching catalog pdf:', e);
  }

  const links = [
    {
      title: 'CATÁLOGO DEL MES',
      subtitle: '¡Descubre nuestra colección premium de temporada!',
      icon: <ShoppingBag size={24} className="text-gold-600" />,
      href: catalogPdfUrl,
      primary: true,
      external: catalogPdfUrl !== '/catalog',
    },
    {
      title: 'PEDIDOS POR WHATSAPP',
      subtitle: '¡Te asesoramos personalmente para elegir el ramo ideal!',
      icon: <MessageCircle size={24} className="text-[#25D366]" />,
      href: `https://wa.me/${whatsappNumber}?text=Hola%20RossyFlowers,%20quiero%20hacer%20un%20pedido%20personalizado.`,
      external: true,
    },
    {
      title: 'NACIMIENTOS',
      subtitle: '¡Celebra la llegada de un nuevo bebé con nosotros!',
      icon: <Heart size={24} className="text-[#F46261]" />,
      href: `https://wa.me/${whatsappNumber}?text=Hola,%20busco%20información%20sobre%20arreglos%20para%20nacimientos.`,
      external: true,
    },
    {
      title: 'GLOBOS Y COMPLEMENTOS',
      subtitle: 'Personaliza tus arreglos con detalles únicos.',
      icon: <Heart size={24} className="text-[#F46261]" />,
      href: `https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20agregar%20globos%20a%20mi%20pedido.`,
      external: true,
    },
    {
      title: 'COMPRAS CORPORATIVAS',
      subtitle: '¡Regalos personalizados para tu empresa y presupuesto!',
      icon: <Building2 size={24} className="text-luxury-black" />,
      href: `https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20información%20sobre%20ventas%20corporativas.`,
      external: true,
    },
    {
      title: 'SUSCRIPCIÓN DE FLORES',
      subtitle: '¡Recibe flores frescas en casa u oficina semanalmente!',
      icon: <CalendarCheck size={24} className="text-luxury-black" />,
      href: `/suscripcion`,
      external: false,
    },
  ];

  const faqs = [
    {
      q: '¿A qué distritos llegan?',
      a: 'Llegamos a casi todos los distritos de Lima Metropolitana. Puedes validar la cobertura y tarifa exacta en nuestro catálogo al momento de comprar o escribiéndonos por WhatsApp.',
    },
    {
      q: '¿Cuáles son los métodos de pago?',
      a: 'Aceptamos transferencias BCP e Interbank, Yape, Plin y todas las Tarjetas de Crédito/Débito mediante nuestro pago seguro en la web.',
    },
    {
      q: '¿Con cuántos días de anticipación debo pedir?',
      a: 'Contamos con envíos el Mismo Día (Same Day) si pides antes de las 3:00 PM. Sin embargo, para fechas especiales como San Valentín o Día de la Madre recomendamos pedir con 48 hrs de anticipación.',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header Profile */}
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 rounded-full bg-[var(--luxury-cream)] border-2 border-gold-400 p-2 shadow-lg mb-4 flex items-center justify-center">
            <img src="/images/logo.png" alt="RossyFlowers Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="font-serif text-3xl text-luxury-black font-bold uppercase tracking-widest">
            RossyFlowers
          </h1>
          <p className="font-sans text-sm text-luxury-black/70 mt-2">
            Alta Costura Floral en Lima
          </p>
        </div>

        {/* Links Buttons */}
        <div className="space-y-4 mb-16">
          {links.map((link, i) => {
            const ButtonContent = (
              <div
                className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer ${
                  link.primary 
                    ? 'bg-gold-400 border-gold-500' 
                    : 'bg-[var(--luxury-cream)] border-gold-400/20 hover:border-gold-400'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center border border-white/40">
                  {link.icon}
                </div>
                <div className="ml-4 flex-grow text-left">
                  <h3 className={`font-sans font-bold text-sm sm:text-base tracking-wider uppercase ${link.primary ? 'text-[#111111]' : 'text-luxury-black'}`}>
                    {link.title}
                  </h3>
                  <p className={`font-sans text-xs mt-0.5 ${link.primary ? 'text-[#111111]/80' : 'text-luxury-black/60'}`}>
                    {link.subtitle}
                  </p>
                </div>
              </div>
            );

            if (link.external) {
              return (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="block">
                  {ButtonContent}
                </a>
              );
            }
            return (
              <Link key={i} href={link.href} className="block">
                {ButtonContent}
              </Link>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-luxury-black font-bold uppercase tracking-widest text-center mb-6">
            Preguntas Frecuentes
          </h2>
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-[var(--luxury-cream)] rounded-xl border border-gold-400/20 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-sans font-semibold text-sm text-luxury-black">
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-gold-500" />
                  {faq.q}
                </div>
                <span className="transition group-open:rotate-180 text-gold-500">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm font-sans text-luxury-black/70 leading-relaxed border-t border-gold-400/10 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

      </div>
    </div>
  );
}
