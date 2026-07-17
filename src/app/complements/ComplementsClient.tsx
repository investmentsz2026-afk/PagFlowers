'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, Grid3X3, Grid2X2 } from 'lucide-react';
import MagicRings from '@/components/ui/MagicRings';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  saleDescription: string | null;
  images: string[];
  stock: number;
  category: string;
  tags: string[];
  isExclusive: boolean;
  isFeatured: boolean;
}

interface Category {
  name: string;
  slug: string;
}

export default function ComplementsClient({
  initialProducts,
  dbCategories = [],
}: {
  initialProducts: Product[];
  dbCategories?: Category[];
}) {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc
  const [viewCols, setViewCols] = useState(4); // 4 or 3 cols

  // Unique categories list based on dynamic dbCategories
  const categories = useMemo(() => {
    return ['TODOS', 'OFERTAS', ...dbCategories.map(cat => cat.slug)];
  }, [dbCategories]);

  // Translate category slug to user-friendly label
  const getCategoryLabel = (slug: string) => {
    if (slug === 'TODOS') return 'Ver Todos';
    if (slug === 'OFERTAS') return 'Ofertas';
    return dbCategories.find(c => c.slug === slug)?.name || slug;
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory === 'OFERTAS') {
      result = result.filter(p => p.salePrice !== null);
    } else if (selectedCategory !== 'TODOS') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort products
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pA = a.salePrice !== null ? a.salePrice : a.price;
        const pB = b.salePrice !== null ? b.salePrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pA = a.salePrice !== null ? a.salePrice : a.price;
        const pB = b.salePrice !== null ? b.salePrice : b.price;
        return pB - pA;
      });
    } else {
      // newest
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const renderProductCard = (prod: Product) => {
    const hasOffer = prod.salePrice !== null;
    const isOutOfStock = prod.stock <= 0;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        key={prod.id}
        className="group flex flex-col border border-gold-400/10 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-[var(--luxury-cream)]/90 backdrop-blur-md"
      >
        {/* Image Box */}
        <div className="relative aspect-square overflow-hidden bg-[var(--luxury-cream)]/50">
          <img
            src={prod.images[0] || '/images/products/combo-especial.webp'}
            alt={prod.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Tag badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {prod.isExclusive && (
              <span className="bg-luxury-black text-gold-300 font-sans text-[8px] uppercase font-bold tracking-widest py-1.5 px-2.5 rounded shadow">
                Exclusivo
              </span>
            )}
            {hasOffer && (
              <span className="bg-red-600 text-white font-sans text-[8px] uppercase font-bold tracking-widest py-1.5 px-2.5 rounded shadow">
                Oferta
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-luxury-gray text-white font-sans text-[8px] uppercase font-bold tracking-widest py-1.5 px-2.5 rounded shadow">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between space-y-2 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <span className="font-sans text-[8px] sm:text-[9px] tracking-wider uppercase text-gold-600 font-bold block line-clamp-1">
              {getCategoryLabel(prod.category)}
            </span>
            <h2 className="font-serif text-xs sm:text-base text-luxury-black font-semibold leading-snug line-clamp-2 sm:line-clamp-1 group-hover:text-gold-500 transition-colors">
              {prod.name}
            </h2>
            {prod.saleDescription ? (
              <p className="font-sans text-[9px] sm:text-xs text-red-500 line-clamp-1 sm:line-clamp-2 leading-relaxed font-semibold hidden sm:block bg-red-500/10 px-2 py-1 rounded inline-block">
                {prod.saleDescription}
              </p>
            ) : (
              <p className="font-sans text-[9px] sm:text-xs text-luxury-black/50 line-clamp-1 sm:line-clamp-2 leading-relaxed font-light hidden sm:block">
                {prod.description}
              </p>
            )}
          </div>

          {/* Pricing and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 sm:pt-4 border-t border-gold-400/5 gap-2 sm:gap-0">
            <div className="flex flex-col">
              {hasOffer ? (
                <>
                  <span className="font-serif text-sm sm:text-base text-red-600 font-bold">
                    S/ {prod.salePrice!.toFixed(2)}
                  </span>
                  <span className="font-sans text-[8px] sm:text-[10px] line-through text-luxury-black/40">
                    S/ {prod.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-serif text-sm sm:text-base text-luxury-black font-bold">
                  S/ {prod.price.toFixed(2)}
                </span>
              )}
            </div>
            <Link
              href={`/product/${prod.id}`}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 border rounded font-sans text-[9px] sm:text-xs uppercase tracking-widest font-semibold transition-all duration-300 text-center ${
                isOutOfStock
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gold-400/30 text-luxury-black hover:bg-gold-400 hover:border-gold-400 hover:text-luxury-black'
              }`}
            >
              {isOutOfStock ? 'Agotado' : 'Comprar'}
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      {/* 1. Page Header (Full Screen Welcome Hero) */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden mb-12 shadow-2xl">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero/banner-2.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[var(--luxury-cream)] dark:to-[var(--background)] z-0" />
        
        {/* MagicRings Background */}
        <div className="absolute inset-0 z-0 opacity-90 flex items-center justify-center pointer-events-auto mix-blend-screen">
          <MagicRings
            darkColor="#A855F7" 
            darkColorTwo="#00C9FF"
            lightColor="#DC2626"
            lightColorTwo="#16A34A"
            color="#D4AF37"
            colorTwo="#E11D48"
            ringCount={8}
            speed={0.8}
            attenuation={10}
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
            mouseInfluence={0.2}
            hoverScale={1.1}
            parallax={0.05}
            clickBurst={true}
          />
        </div>

        {/* Title Content */}
        <div className="relative z-10 text-center space-y-6 px-4 pt-16">
          <span className="font-sans text-sm sm:text-base tracking-[0.5em] text-gold-400 uppercase font-bold block drop-shadow-md">
            Complementa tus Regalos
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-white font-bold tracking-wide drop-shadow-2xl uppercase">
            Globos y Detalles
          </h1>
          <p className="font-sans text-sm sm:text-lg text-white/90 max-w-2xl mx-auto tracking-widest drop-shadow-md">
            CHOCOLATES, VINOS, CERVEZAS, ORQUÍDEAS Y GLOBOS EXCLUSIVOS
          </p>
          <div className="w-32 h-1.5 bg-gold-400 mx-auto mt-10 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">

        {/* 2. Search & Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[var(--luxury-cream)]/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl p-4 rounded-3xl border border-[var(--luxury-rose)]/30 dark:border-white/20 shadow-lg">
          {/* Search */}
          <div className="flex-1 flex items-center border border-[#2B1210]/35 dark:border-white/20 rounded-2xl px-4 py-2.5 bg-white/80 dark:bg-black/60 shadow-sm transition-all focus-within:border-gold-500 focus-within:ring-1 focus-within:ring-gold-500">
            <Search size={18} className="text-[#111111]/70 dark:text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar complementos por nombre, descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-sans text-sm py-1 placeholder:text-[#2B1210]/55 dark:placeholder:text-slate-400 text-[#111111] dark:text-white font-semibold"
            />
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-[#2B1210]/35 dark:border-white/20 rounded-2xl px-4 py-2.5 bg-white/80 dark:bg-black/60 shadow-sm text-xs font-sans text-[#111111] dark:text-white/90 font-bold transition-colors hover:border-gold-400">
              <ArrowUpDown size={14} className="text-gold-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 font-bold cursor-pointer text-[#111111] dark:text-white"
              >
                <option className="bg-[var(--luxury-cream)] dark:bg-[var(--background)]" value="newest">Últimos Diseños</option>
                <option className="bg-[var(--luxury-cream)] dark:bg-[var(--background)]" value="price-asc">Precio: Menor a Mayor</option>
                <option className="bg-[var(--luxury-cream)] dark:bg-[var(--background)]" value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>

            {/* Grid columns toggle */}
            <div className="hidden lg:flex border border-[var(--luxury-rose)]/30 dark:border-white/20 rounded-2xl p-1.5 bg-[var(--luxury-cream)] dark:bg-black/60 shadow-sm">
              <button
                onClick={() => setViewCols(3)}
                className={`p-1.5 rounded transition-colors ${viewCols === 3 ? 'bg-gold-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'}`}
                aria-label="Ver en 3 columnas"
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setViewCols(4)}
                className={`p-1.5 rounded transition-colors ${viewCols === 4 ? 'bg-gold-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'}`}
                aria-label="Ver en 4 columnas"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Category Pills Slider */}
        <div className="relative w-full mb-8">
          <div className="flex flex-nowrap md:flex-wrap md:justify-center overflow-x-auto md:overflow-visible pb-4 gap-3 scrollbar-none snap-x md:snap-none px-1">
            {categories.map((cat) => {
              const label = getCategoryLabel(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`snap-center flex-shrink-0 px-6 py-3 rounded-full text-xs font-sans uppercase tracking-widest font-extrabold transition-all duration-300 shadow-sm border ${
                    selectedCategory === cat
                      ? 'bg-gold-400 border-gold-400 text-[#000000] scale-105 shadow-md'
                      : 'bg-white/80 dark:bg-black/40 border-[#2B1210]/15 dark:border-white/10 text-luxury-black dark:text-white/80 hover:border-gold-400 hover:text-gold-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Products Grid */}
        <div className="relative min-h-[40vh]">
          {filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-24 space-y-4"
            >
              <p className="font-serif text-xl text-luxury-black/60 dark:text-white/60">
                No encontramos productos en esta categoría por el momento.
              </p>
              <button 
                onClick={() => { setSelectedCategory('TODOS'); setSearchQuery(''); }}
                className="px-6 py-2.5 bg-gold-400 text-luxury-black font-sans text-xs uppercase tracking-widest font-bold rounded-full hover:bg-gold-500 transition-colors"
              >
                Ver Todos los Complementos
              </button>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${viewCols} gap-4 sm:gap-8`}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => renderProductCard(prod))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
