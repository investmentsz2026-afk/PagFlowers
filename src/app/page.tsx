import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import HeroCarousel from '@/components/home/HeroCarousel';
import TestimonialSlider from '@/components/home/TestimonialSlider';
import DistrictSearch from '@/components/home/DistrictSearch';
import MotionView, { TextReveal } from '@/components/home/MotionView';
import ContactForm from '@/components/home/ContactForm';
import ScrollCarousel from '@/components/home/ScrollCarousel';
import CurvedLoop from '@/components/ui/CurvedLoop';
import MagicRings from '@/components/ui/MagicRings';
import { ArrowRight, Sparkles, Check, Gift, MapPin, Mail, Phone, Clock, MessageCircle } from 'lucide-react';

export const revalidate = 60; // Revalidate cache every minute

export default async function HomePage() {
  let banners: any[] = [];
  let districts: any[] = [];
  let featuredProducts: any[] = [];
  let exclusiveProducts: any[] = [];
  let saleProducts: any[] = [];
  let ourStory = {
    title: 'NUESTRO ARTE, TU HISTORIA',
    subtitle: 'RossyFlowers Art',
    text1: 'En RossyFlowers entendemos que las flores no son un obsequio cualquiera; son un canal directo hacia el corazón y la memoria de quien las recibe. Diseñamos bajo un concepto de alta costura floral en Lima, seleccionando cada tallo una por una para crear composiciones cargadas de emoción, elegancia y exclusividad.',
    text2: 'Evitamos los arreglos genéricos y ordinarios. Cada uno de nuestros diseños cuenta con un sello propio de lujo, desde nuestras cajas aterciopeladas hasta las dedicatorias lacradas a mano con cera real. Hacemos que cada entrega genere un verdadero impacto WOW, transformando un día común en una anécdota de orgullo inolvidable.',
    image: '/images/products/bouquet-pasteles.webp'
  };

  try {
    // 1. Fetch Banner settings from database
    const bannerContent = await prisma.content.findUnique({
      where: { key: 'home_banners' },
    });
    if (bannerContent) {
      banners = JSON.parse(bannerContent.value);
    } else {
      banners = [
        {
          id: 1,
          title: 'Elegancia y Exclusividad en Cada Flor',
          subtitle: 'Diseños florales de autor inspirados en la alta costura para expresar tus sentimientos más profundos en Lima.',
          buttonText: 'Ver Colección Premium',
          image: '/images/hero/banner-1.webp',
          link: '/catalog',
        },
      ];
    }

    // 2. Fetch Our Story settings
    const storyContent = await prisma.content.findUnique({
      where: { key: 'our_story' },
    });
    if (storyContent) {
      ourStory = { ...ourStory, ...JSON.parse(storyContent.value) };
    }

    // 3. Fetch Delivery coverage settings
    const districtsContent = await prisma.content.findUnique({
      where: { key: 'delivery_districts' },
    });
    if (districtsContent) {
      districts = JSON.parse(districtsContent.value);
    } else {
      districts = [{ name: 'Miraflores', cost: 15 }];
    }

    // 3. Fetch products categories
    featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    });

    exclusiveProducts = await prisma.product.findMany({
      where: { isExclusive: true },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    });

    saleProducts = await prisma.product.findMany({
      where: { NOT: { salePrice: null } },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    });
  } catch (error) {
    console.error('Failed to load database content in homepage:', error);
  }

  // Categories list static metadata
  const categories = [
    {
      name: 'Ramos Exclusivos',
      slug: 'Ramos',
      image: '/images/products/bouquet-pasteles.webp',
      desc: 'Bouquets de rosas, tulipanes y flores selectas de estación.',
    },
    {
      name: 'Cajas de Lujo',
      slug: 'Cajas de Lujo',
      image: '/images/products/caja-rosas.webp',
      desc: 'Cajas aterciopeladas circulares y hexagonales de diseño.',
    },
    {
      name: 'Orquídeas Imperiales',
      slug: 'Orquídeas',
      image: '/images/products/orquidea-blanca.webp',
      desc: 'Phalaenopsis de doble y triple tallo de elegancia absoluta.',
    },
    {
      name: 'Detalles y Regalos',
      slug: 'Detalles Especiales',
      image: '/images/products/combo-especial.webp',
      desc: 'Complementos premium como chocolates belgas y peluches.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-clip">
      {/* 1. Hero Slideshow Banner */}
      <HeroCarousel banners={banners} />

      {/* 2. Brand Value Props Section */}
      <section className="py-16 bg-[#F46261] dark:bg-[var(--background)] border-b border-white/20 dark:border-gold-400/10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center">
            <MotionView direction="up" delay={0.1} className="space-y-3">
              <span className="text-white dark:text-gold-500 font-semibold font-serif text-3xl tracking-widest block drop-shadow-sm dark:drop-shadow-none">100%</span>
              <h3 className="font-sans text-xs uppercase tracking-wider text-white dark:text-luxury-black font-bold drop-shadow-sm dark:drop-shadow-none">Frescura Garantizada</h3>
              <p className="font-sans text-xs text-white/90 dark:text-luxury-black/50 px-4">Flores de invernadero seleccionadas una por una</p>
            </MotionView>
            <MotionView direction="up" delay={0.2} className="space-y-3 border-l border-white/20 dark:border-gold-400/10">
              <span className="text-white dark:text-gold-500 font-semibold font-serif text-3xl tracking-widest block drop-shadow-sm dark:drop-shadow-none">SAME DAY</span>
              <h3 className="font-sans text-xs uppercase tracking-wider text-white dark:text-luxury-black font-bold drop-shadow-sm dark:drop-shadow-none">Despacho Veloz</h3>
              <p className="font-sans text-xs text-white/90 dark:text-luxury-black/50 px-4">Entregas seguras el mismo día hasta las 4:00 PM</p>
            </MotionView>
            <MotionView direction="up" delay={0.3} className="space-y-3 border-l border-white/20 dark:border-gold-400/10">
              <span className="text-white dark:text-gold-500 font-semibold font-serif text-3xl tracking-widest block drop-shadow-sm dark:drop-shadow-none">PREMIUM</span>
              <h3 className="font-sans text-xs uppercase tracking-wider text-white dark:text-luxury-black font-bold drop-shadow-sm dark:drop-shadow-none">Tarjetas de Autor</h3>
              <p className="font-sans text-xs text-white/90 dark:text-luxury-black/50 px-4">Dedicatorias de lujo lacradas con cera artesanal</p>
            </MotionView>
            <MotionView direction="up" delay={0.4} className="space-y-3 border-l border-white/20 dark:border-gold-400/10">
              <span className="text-white dark:text-gold-500 font-semibold font-serif text-3xl tracking-widest block drop-shadow-sm dark:drop-shadow-none">VIP PHOTO</span>
              <h3 className="font-sans text-xs uppercase tracking-wider text-white dark:text-luxury-black font-bold drop-shadow-sm dark:drop-shadow-none">Garantía Visual</h3>
              <p className="font-sans text-xs text-white/90 dark:text-luxury-black/50 px-4">Recibe fotos de tu arreglo antes de la entrega</p>
            </MotionView>
          </div>
        </div>
      </section>

      {/* 3. Section: "Nuestra Historia / Sobre Nosotros" */}
      <section id="nosotros" className="py-24 bg-[#FFBAA8] dark:bg-[var(--luxury-cream)] relative scroll-mt-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Asymmetrical Images Stack */}
            <div className="lg:col-span-6 relative flex flex-col items-center">
              <MotionView direction="right" className="w-4/5 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl z-10 border border-gold-400/10">
                <img
                  src={ourStory.image}
                  alt="Alta costura floral RossyFlowers"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </MotionView>
              <MotionView direction="left" delay={0.2} className="w-1/2 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl absolute -bottom-10 -left-4 z-20 border-4 border-luxury-cream hidden sm:block">
                <img
                  src="/images/products/caja-rosas.webp"
                  alt="Detalles de lujo de RossyFlowers"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </MotionView>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-gold-400/20 rounded-tr-3xl pointer-events-none hidden lg:block" />
            </div>

            {/* Right Column: Motivational Text Content */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="font-sans text-xs tracking-[0.4em] text-gold-600 uppercase font-semibold block">{ourStory.subtitle}</span>
                <TextReveal
                  tag="h2"
                  text={ourStory.title}
                  className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-wider text-luxury-black leading-tight"
                />
                <div className="w-20 h-0.5 bg-gold-400 mt-4" />
              </div>

              <MotionView direction="up" delay={0.2} className="space-y-6">
                <p className="font-sans text-base text-luxury-black/80 leading-relaxed font-light whitespace-pre-line">
                  {ourStory.text1.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
                <p className="font-sans text-sm text-luxury-black/65 leading-relaxed font-light whitespace-pre-line">
                  {ourStory.text2.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
                <div className="pt-4 flex flex-wrap gap-6 items-center">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#F46261] text-white hover:bg-[#E65A5A] dark:bg-[var(--foreground)] dark:text-[var(--background)] dark:hover:bg-gold-500 font-semibold text-xs tracking-widest uppercase transition-all duration-300 rounded shadow-[0_4px_14px_0_rgba(244,98,97,0.39)] dark:shadow-md"
                  >
                    Ver Catálogo Floral <ArrowRight size={14} />
                  </Link>
                  <a
                    href="#contacto"
                    className="font-sans text-xs tracking-widest uppercase text-[#F46261] dark:text-luxury-black hover:text-[#E65A5A] dark:hover:text-gold-600 font-bold border-b border-[#F46261] dark:border-luxury-black hover:border-[#E65A5A] dark:hover:border-gold-600 pb-1 transition-all"
                  >
                    Asesoría de Diseño
                  </a>
                </div>
              </MotionView>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Horizontal Scroll Carousel */}
      <ScrollCarousel products={featuredProducts} />


      {/* 4. Categories Navigation Cards */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Clearer Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-70 blur-[1px] saturate-100"
          style={{ backgroundImage: `url('/images/hero/banner-1.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F46261] via-[#F46261]/80 to-[var(--background)] dark:from-[#0A0A0A] dark:via-black/20 dark:to-[#0A0A0A] pointer-events-none" />

        {/* Curved Title Animation with Two 3D Images */}
        <div className="relative w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] mt-10 mb-8 sm:mb-12">
          
          {/* The curved text pushed lower */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden translate-y-16 sm:translate-y-24">
            <CurvedLoop 
              marqueeText="✦ DESPEDIDAS CON AMOR ✦ HOMENAJES FLORALES ✦ CONDOLENCIAS ✦ ARREGLOS FÚNEBRES "
              speed={1.5}
              curveAmount={150}
              direction="left"
              interactive={true}
            />
          </div>
          
          {/* Four 3D Images placed side by side, pushed higher so they don't touch the text */}
          <div className="absolute top-[-20px] sm:top-[-40px] z-10 flex gap-3 sm:gap-8 perspective-[1000px] w-full max-w-5xl justify-center px-2">
            {/* Image 1 */}
            <div className="w-20 h-32 sm:w-40 sm:h-56 relative group hover:-translate-y-4 hover:scale-105 transition-all duration-[800ms] ease-out shadow-[0_30px_60px_rgba(212,175,55,0.3)] border-2 border-gold-400/50 rounded-t-full rounded-b-xl sm:rounded-b-2xl overflow-hidden cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
              <img src="/images/products/bouquet-pasteles.webp" alt="Homenajes" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125 saturate-50 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <span className="font-serif text-gold-400 font-bold tracking-widest uppercase text-[8px] sm:text-xs drop-shadow-md">Respeto</span>
              </div>
            </div>

            {/* Image 2 */}
            <div className="w-20 h-32 sm:w-40 sm:h-56 relative group hover:-translate-y-4 hover:scale-105 transition-all duration-[800ms] ease-out shadow-[0_30px_60px_rgba(212,175,55,0.3)] border-2 border-gold-400/50 rounded-t-full rounded-b-xl sm:rounded-b-2xl overflow-hidden cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
              <img src="/images/products/caja-rosas.webp" alt="Condolencias" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125 saturate-50 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <span className="font-serif text-gold-400 font-bold tracking-widest uppercase text-[8px] sm:text-xs drop-shadow-md">Paz</span>
              </div>
            </div>

            {/* Image 3 */}
            <div className="w-20 h-32 sm:w-40 sm:h-56 relative group hover:-translate-y-4 hover:scale-105 transition-all duration-[800ms] ease-out shadow-[0_30px_60px_rgba(212,175,55,0.3)] border-2 border-gold-400/50 rounded-t-full rounded-b-xl sm:rounded-b-2xl overflow-hidden cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
              <img src="/images/products/orquidea-blanca.webp" alt="Orquídea Blanca" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125 saturate-50 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <span className="font-serif text-gold-400 font-bold tracking-widest uppercase text-[8px] sm:text-xs drop-shadow-md">Esperanza</span>
              </div>
            </div>

            {/* Image 4 */}
            <div className="w-20 h-32 sm:w-40 sm:h-56 relative group hover:-translate-y-4 hover:scale-105 transition-all duration-[800ms] ease-out shadow-[0_30px_60px_rgba(212,175,55,0.3)] border-2 border-gold-400/50 rounded-t-full rounded-b-xl sm:rounded-b-2xl overflow-hidden cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
              <img src="/images/products/combo-especial.webp" alt="Combo Especial" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125 saturate-50 group-hover:saturate-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <span className="font-serif text-gold-400 font-bold tracking-widest uppercase text-[8px] sm:text-xs drop-shadow-md">Memoria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {categories.map((cat, idx) => (
              <MotionView
                key={idx}
                direction="up"
                delay={idx * 0.15}
                className="group relative h-[250px] sm:h-[450px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gold-400/20 flex flex-col justify-end p-4 sm:p-8 bg-neutral-950 transition-all duration-500 hover:-translate-y-3"
              >
                {/* Background image zoom effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                {/* Darker Overlay transition for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 space-y-2 sm:space-y-4">
                  <span className="font-sans text-[8px] sm:text-[10px] uppercase tracking-widest text-gold-400 font-bold block drop-shadow-md">
                    Colección
                  </span>
                  <h3 className="font-serif text-sm sm:text-2xl text-white font-bold uppercase tracking-wide group-hover:text-gold-300 transition-colors drop-shadow-md">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block font-sans text-xs text-neutral-300 font-light leading-relaxed h-0 opacity-0 overflow-hidden group-hover:h-12 group-hover:opacity-100 transition-all duration-500">
                    {cat.desc}
                  </p>
                  
                  <div className="pt-2">
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gold-500/20 hover:bg-gold-500 text-gold-300 hover:text-neutral-950 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest rounded-lg transition-all duration-300 border border-gold-500/30 backdrop-blur-sm"
                    >
                      Explorar Catálogo <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </MotionView>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Exclusive Selection Highlight Section */}
      {exclusiveProducts.length > 0 && (
        <section className="py-28 bg-gradient-to-br from-[#FFA58E] to-[#FF8E75] dark:from-[#0D0D0D] dark:to-[#0D0D0D] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-500">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px]" />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 relative z-10">
            <div className="text-center space-y-3">
              <span className="font-sans text-xs tracking-[0.4em] text-gold-600 dark:text-gold-400 uppercase font-semibold flex items-center justify-center gap-2 drop-shadow-sm">
                <Sparkles size={14} className="animate-pulse text-gold-500 dark:text-gold-400" /> Alta Costura Floral
              </span>
              <TextReveal
                tag="h2"
                text="SELECCIÓN ALTA FLORERÍA"
                className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-wider text-slate-900 dark:text-white drop-shadow-sm"
              />
              <p className="font-sans text-xs text-slate-600 dark:text-white/50 max-w-lg mx-auto tracking-wide mt-2">
                Diseños imponentes y estructurados, ideados para deslumbrar y manifestar exclusividad en su máxima expresión.
              </p>
              <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {exclusiveProducts.map((prod, idx) => (
                <MotionView
                  key={prod.id}
                  direction="up"
                  delay={idx * 0.2}
                  className="bg-[var(--luxury-cream)]/50 dark:bg-[#1A1A1A]/30 backdrop-blur-md rounded-3xl border-[3px] border-t-gold-300 border-l-gold-300 border-b-gold-600 border-r-gold-600 dark:border-t-gold-500 dark:border-l-gold-500 dark:border-b-gold-800 dark:border-r-gold-800 overflow-hidden hover:bg-[var(--luxury-cream)]/70 dark:hover:bg-[#1A1A1A]/50 transition-all duration-500 flex flex-col group shadow-[0_10px_30px_rgba(212,175,55,0.15)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.35)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)]"
                >
                  <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 bg-gold-400 text-[#111111] font-sans text-[9px] uppercase font-extrabold tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                      Exclusivo
                    </div>
                  </div>
                  <div className="p-8 space-y-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="font-serif text-xl text-slate-900 dark:text-white font-bold uppercase tracking-wider">{prod.name}</h3>
                      <p className="font-sans text-xs text-slate-600 dark:text-white/50 line-clamp-2 font-light leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gold-800/20">
                      <span className="font-serif text-xl text-gold-600 dark:text-gold-300 font-bold">S/ {prod.price.toFixed(2)}</span>
                      <Link
                        href={`/product/${prod.id}`}
                        className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-slate-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-300 font-bold transition-all group/btn"
                      >
                        Personalizar <ArrowRight size={12} className="group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </MotionView>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Featured / Best Seller Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="relative py-24 bg-gradient-to-b from-[#FFA38C] to-[#FF896E] dark:from-slate-800 dark:to-slate-900 overflow-hidden">
          
          {/* Magic Rings Background Animation */}
          <div className="absolute inset-0 z-0 opacity-80 flex items-center justify-center pointer-events-auto mix-blend-normal dark:mix-blend-screen">
            <MagicRings
              darkColor="#A855F7" 
              darkColorTwo="#00C9FF"
              lightColor="#DC2626" // Rojo
              lightColorTwo="#16A34A" // Verde
              color="#D4AF37"
              colorTwo="#E11D48"
              ringCount={8}
              speed={0.8}
              attenuation={15}
              lineThickness={2}
              baseRadius={0.4}
              radiusStep={0.15}
              scaleRate={0.1}
              opacity={0.8}
              blur={0}
              noiseAmount={0.05}
              rotation={0}
              ringGap={1.8}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={true}
              mouseInfluence={0.15}
              hoverScale={1.1}
              parallax={0.05}
              clickBurst={true}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="font-sans text-xs tracking-[0.4em] text-slate-600 dark:text-gold-400 uppercase font-semibold block drop-shadow-sm">Los Favoritos de Lima</span>
              <TextReveal
                tag="h2"
                text="DISEÑOS DESTACADOS"
                className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-wider text-slate-900 dark:text-white drop-shadow-md"
              />
              <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map((prod, idx) => {
                const hasOffer = prod.salePrice !== null;
                return (
                  <MotionView
                    key={prod.id}
                    direction="up"
                    delay={idx * 0.1}
                    className="group flex flex-col border border-gold-400/5 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-[var(--luxury-cream)]/90 backdrop-blur-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-neutral-50">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {hasOffer && (
                        <div className="absolute top-2 left-2 sm:top-6 sm:left-6 bg-red-600 text-white font-sans text-[7px] sm:text-[9px] uppercase font-bold tracking-widest py-1 px-2 sm:py-1.5 sm:px-4 rounded-full shadow-md">
                          Oferta
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-6 flex-grow flex flex-col justify-between space-y-2 sm:space-y-4">
                      <div className="space-y-1">
                        <span className="font-sans text-[8px] sm:text-[10px] tracking-widest uppercase text-gold-600 font-bold block line-clamp-1">
                          {prod.category}
                        </span>
                        <h3 className="font-serif text-xs sm:text-lg text-luxury-black font-bold uppercase tracking-wide leading-snug line-clamp-2 sm:line-clamp-1 group-hover:text-gold-600 transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 sm:pt-4 border-t border-gold-400/5 gap-2 sm:gap-0">
                        <div className="flex flex-col">
                          {hasOffer ? (
                            <>
                              <span className="font-serif text-sm sm:text-lg text-luxury-black font-bold">
                                S/ {prod.salePrice.toFixed(2)}
                              </span>
                              <span className="font-sans text-[8px] sm:text-[10px] line-through text-luxury-black/30">
                                S/ {prod.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-serif text-sm sm:text-lg text-luxury-black font-bold">
                              S/ {prod.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/product/${prod.id}`}
                          className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gold-400/40 text-luxury-black hover:bg-gold-500 hover:text-white hover:border-gold-500 rounded-lg transition-all duration-300 text-[9px] sm:text-xs font-semibold text-center"
                        >
                          Detalles
                        </Link>
                      </div>
                    </div>
                  </MotionView>
                );
              })}
            </div>

            <div className="text-center pt-8">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-luxury-black hover:text-gold-500 font-bold border-b border-luxury-black hover:border-gold-500 pb-2 transition-all"
              >
                Ver Catálogo Completo <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. Coverage & Pricing check section */}
      <section className="py-24 bg-luxury-rose/30 border-t border-b border-gold-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="font-sans text-xs tracking-[0.4em] text-gold-600 uppercase font-semibold block">Envío Aclimatado</span>
              <TextReveal
                tag="h2"
                text="DELIVERY PREMIUM EN LIMA"
                className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-luxury-black leading-tight"
              />
              <div className="w-16 h-0.5 bg-gold-400 mt-3" />
            </div>
            
            <p className="font-sans text-base text-luxury-black/75 leading-relaxed font-light">
              Entregamos sus arreglos florales directamente en la puerta de su ser querido con transporte aclimatado y choferes de confianza para asegurar que lleguen en su máximo esplendor.
            </p>
            <ul className="space-y-4 font-sans text-xs text-luxury-black/70">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-600">
                  <Check size={14} />
                </div>
                <span>Rangos de entrega flexibles: 9am-1pm, 1pm-5pm y 5pm-8pm.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-600">
                  <Check size={14} />
                </div>
                <span>Confirmación vía SMS / WhatsApp en tiempo real al concretar la entrega.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-600">
                  <Check size={14} />
                </div>
                <span>Tarjetas dedicatorias selladas a mano con lacre artesanal.</span>
              </li>
            </ul>
          </div>
          <div>
            <DistrictSearch districts={districts} />
          </div>
        </div>
      </section>

      {/* 8. Section: "Contacto y Asesoría Floral" */}
      <section id="contacto" className="py-24 bg-[var(--background)] relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left Column: Contact details */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-3">
                <span className="font-sans text-xs tracking-[0.4em] text-gold-600 uppercase font-semibold block">Asesoría de Autor</span>
                <TextReveal
                  tag="h2"
                  text="ASESORÍA PERSONALIZADA"
                  className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-luxury-black"
                />
                <div className="w-16 h-0.5 bg-gold-400 mt-3" />
              </div>

              <p className="font-sans text-base text-luxury-black/70 leading-relaxed font-light">
                ¿Busca una composición a medida para un evento especial, o tiene alguna idea floral específica en mente? Nuestros expertos floristas están a su disposición para asesorarle en cada detalle.
              </p>

              <div className="space-y-6 pt-4">
                <a
                  href="https://wa.me/51999999999?text=Hola,%20quisiera%20asesoría%20personalizada%20para%20un%20arreglo%20floral."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 rounded-2xl shadow-xl w-full sm:w-auto"
                >
                  <MessageCircle size={18} className="fill-white" /> Consultar por WhatsApp
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[var(--luxury-cream)] text-gold-600 border border-gold-400/10 rounded-xl">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Dirección</h4>
                      <p className="font-sans text-xs text-luxury-black/80 font-medium mt-1">Calle Monte Real 110</p>
                      <p className="font-sans text-xs text-luxury-black/50">La Molina, Lima</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[var(--luxury-cream)] text-gold-600 border border-gold-400/10 rounded-xl">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Contacto</h4>
                      <p className="font-sans text-xs text-luxury-black/80 font-medium mt-1">contacto@rossyflowers.com</p>
                      <p className="font-sans text-xs text-luxury-black/50">Telf: (01) 456-7890</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[var(--luxury-cream)] text-gold-600 border border-gold-400/10 rounded-xl">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Atención</h4>
                      <p className="font-sans text-xs text-luxury-black/80 font-medium mt-1">Lun - Sáb: 8:00 AM - 8:00 PM</p>
                      <p className="font-sans text-xs text-luxury-black/50">Dom: 9:00 AM - 4:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[var(--luxury-cream)] text-gold-600 border border-gold-400/10 rounded-xl">
                      <Gift size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-luxury-black/40 font-bold">Pedidos hoy</h4>
                      <p className="font-sans text-xs text-luxury-black/80 font-medium mt-1">Hasta las 4:00 PM</p>
                      <p className="font-sans text-xs text-luxury-black/50">Entrega el mismo día</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* 9. Client Reviews Section */}
      <section className="py-24 bg-[#F46261] dark:bg-[var(--luxury-cream)] border-t border-white/20 dark:border-gold-400/10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <span className="font-sans text-xs tracking-[0.4em] text-white/90 dark:text-gold-600 uppercase font-semibold block drop-shadow-sm dark:drop-shadow-none">Testimonios Reales</span>
            <TextReveal
              tag="h2"
              text="LA EXPERIENCIA ROSSYFLOWERS"
              className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-white dark:text-luxury-black drop-shadow-sm dark:drop-shadow-none"
            />
            <div className="w-16 h-0.5 bg-white/50 dark:bg-gold-400 mx-auto mt-4" />
          </div>

          <TestimonialSlider />
        </div>
      </section>
    </div>
  );
}
