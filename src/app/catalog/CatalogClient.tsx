'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Grid3X3, Grid2X2 } from 'lucide-react';

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

import MagicRings from '@/components/ui/MagicRings';

export default function CatalogClient({
  initialProducts,
  initialCategory = 'TODOS',
  dbCategories = [],
}: {
  initialProducts: Product[];
  initialCategory?: string;
  dbCategories?: any[];
}) {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, stock-desc
  const [viewCols, setViewCols] = useState(4); // 4 or 3 cols

  // Unique categories list
  const categories = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return ['TODOS', 'OFERTAS', ...dbCategories.map(cat => cat.name)];
    }
    const list = new Set(products.map((p) => p.category));
    return ['TODOS', 'OFERTAS', ...Array.from(list)];
  }, [products, dbCategories]);

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
    } else if (sortBy === 'stock-desc') {
      result.sort((a, b) => b.stock - a.stock);
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
            src={prod.images[0]}
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
              {prod.category}
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
      <div className="relative w-full h-[80vh] sm:h-screen flex items-center justify-center overflow-hidden mb-12 shadow-2xl">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero/banner-1.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[var(--luxury-cream)] dark:to-[var(--background)] z-0" />
        
        {/* MagicRings Background */}
        <div className="absolute inset-0 z-0 opacity-90 flex items-center justify-center pointer-events-auto mix-blend-screen">
          <MagicRings
            darkColor="#A855F7" 
            darkColorTwo="#00C9FF"
            lightColor="#DC2626" // Rojo
            lightColorTwo="#16A34A" // Verde
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
        <div className="relative z-10 text-center space-y-6 px-4 pt-20 sm:pt-28">
          <span className="font-sans text-sm sm:text-base tracking-[0.5em] text-gold-400 uppercase font-bold block drop-shadow-md">
            Bienvenidos a la
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white font-bold tracking-wide drop-shadow-2xl">
            Alta Florería
          </h1>
          <p className="font-sans text-sm sm:text-lg text-white/90 max-w-2xl mx-auto tracking-widest drop-shadow-md">
            COLECCIÓN EXCLUSIVA DE FLORES Y REGALOS
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
            placeholder="Buscar por nombre, tipo de flor, ocasión..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-sans text-sm py-1 placeholder:text-[#2B1210]/55 dark:placeholder:text-slate-400 text-[#111111] dark:text-white font-semibold"
          />
        </div>

        {/* Filters and Sorting */}
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
              <option className="bg-[var(--luxury-cream)] dark:bg-[var(--background)]" value="stock-desc">Mayor Disponibilidad</option>
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

      {/* 3. Category Pills Slider (Modernized) */}
      <div className="relative w-full mb-8">
        <div className="flex flex-nowrap md:flex-wrap md:justify-center overflow-x-auto md:overflow-visible pb-4 gap-3 scrollbar-none snap-x md:snap-none px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`snap-start relative px-6 py-3 rounded-full font-sans text-xs tracking-widest uppercase font-semibold transition-all duration-500 flex-shrink-0 cursor-pointer overflow-hidden ${
                selectedCategory === cat
                  ? 'text-white shadow-lg scale-105 border-transparent'
                  : 'bg-[var(--luxury-cream)]/70 dark:bg-[#1A1A1A]/60 backdrop-blur-md border border-[var(--luxury-rose)]/20 dark:border-white/10 text-luxury-black/70 dark:text-white/60 hover:bg-[var(--luxury-cream)] dark:hover:bg-[#2A2A2A] hover:border-[#F46261]/50 hover:text-[#F46261] dark:hover:text-[#F46261] shadow-sm hover:shadow-md'
              }`}
            >
              {selectedCategory === cat && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-[#F46261] to-[#FF8C8C] z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat === 'TODOS' ? 'Todos los Productos' : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products grid */}
      <div className="min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-xl text-luxury-black/60">No encontramos resultados</p>
            <p className="font-sans text-xs text-luxury-black/40 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o selecciona otra categoría de nuestro catálogo.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('TODOS');
              }}
              className="inline-block px-5 py-2.5 bg-gold-400 text-luxury-black rounded font-sans text-xs uppercase tracking-widest font-semibold hover:bg-gold-500 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* Special Offers Section */}
            {(selectedCategory === 'TODOS' || selectedCategory === 'OFERTAS') && filteredProducts.some(p => p.salePrice !== null) && (
              <div className="space-y-6">
                <div className="text-left border-b border-red-500/20 pb-4 mb-4 pl-4 bg-red-500/5 rounded-xl border border-red-500/10 shadow-lg relative overflow-hidden pt-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-red-500 font-bold flex items-center gap-2">
                    <span className="animate-pulse">🔥</span> OFERTAS ESPECIALES
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-red-400 font-semibold mt-1 tracking-wider uppercase">
                    Promociones exclusivas por tiempo limitado.
                  </p>
                </div>
                <motion.div
                  layout
                  className={`grid grid-cols-2 sm:grid-cols-2 ${
                    viewCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                  } gap-3 sm:gap-8`}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.filter(p => p.salePrice !== null).map((prod) => renderProductCard(prod))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Category Sections */}
            {(selectedCategory === 'TODOS' ? categories.filter(c => c !== 'TODOS' && c !== 'OFERTAS') : [selectedCategory]).map(cat => {
              if (cat === 'OFERTAS') return null; // Already rendered above
              
              const catProducts = selectedCategory === 'TODOS' 
                ? filteredProducts.filter(p => p.category === cat && p.salePrice === null) 
                : filteredProducts;
                
              if (catProducts.length === 0) return null;
              
              const catObj = dbCategories?.find(d => d.name === cat);
              const description = catObj?.description || `Colección exclusiva de arreglos florales para ${cat.toLowerCase()}.`;
              
              return (
                <div key={cat} className="space-y-6">
                  <div className="text-left border-b border-gold-800/10 pb-2 mb-4 pl-2">
                    <h2 className="font-serif text-2xl sm:text-3xl text-luxury-black font-semibold">{cat}</h2>
                    <p className="font-sans text-xs sm:text-sm text-[#F46261] font-semibold mt-1 tracking-wider uppercase">{description}</p>
                  </div>
                  <motion.div
                    layout
                    className={`grid grid-cols-2 sm:grid-cols-2 ${
                      viewCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                    } gap-3 sm:gap-8`}
                  >
                    <AnimatePresence mode="popLayout">
                      {catProducts.map((prod) => renderProductCard(prod))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
