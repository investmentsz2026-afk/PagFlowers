'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingBag, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  category: string;
  tags: string[];
  isExclusive: boolean;
  isFeatured: boolean;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Custom Gift Card state
  const [cardSender, setCardSender] = useState('');
  const [cardRecipient, setCardRecipient] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [cardStyle, setCardStyle] = useState('GOLD'); // GOLD, WHITE, ROMANCE, MINIMAL
  const [isAdded, setIsAdded] = useState(false);

  const activePrice = product.salePrice !== null ? product.salePrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const cardTemplates = [
    { id: 'GOLD', name: 'Golden Luxury (Lacre)', classes: 'bg-[#FCFAF6] border-[#D4AF37] text-[#111111] font-serif' },
    { id: 'WHITE', name: 'Purity White', classes: 'bg-white border-neutral-200 text-[#111111] font-sans' },
    { id: 'ROMANCE', name: 'Romantic Rose', classes: 'bg-[#FAF0ED] border-[#E8D3C9] text-red-950 font-serif' },
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // Build dedication string
    let fullDedication = '';
    if (cardRecipient || cardMessage || cardSender) {
      fullDedication = `Para: ${cardRecipient || 'Alguien Especial'} | Mensaje: ${cardMessage || 'Sin mensaje'} | De: ${cardSender || 'Anónimo'} (Estilo: ${cardStyle})`;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0],
      },
      quantity,
      fullDedication || null
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Back link */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase text-luxury-black/60 hover:text-[#F46261] font-semibold transition-colors"
        >
          <ArrowLeft size={14} /> Volver al Catálogo
        </Link>
      </div>

      {/* Main product configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Images Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] bg-[var(--background)] border border-gold-400/10 rounded-2xl overflow-hidden shadow-md">
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-all"
            />
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden bg-[var(--background)] border transition-all ${
                    activeImageIdx === idx ? 'border-[#F46261] ring-2 ring-[#F46261]/20 scale-105' : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100 hover:border-[#F46261]/50'
                  }`}
                >
                  <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Configurations Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-[#F46261]">
                {product.category}
              </span>
              {product.isExclusive && (
                <span className="bg-luxury-black text-white font-sans text-[8px] uppercase font-bold tracking-widest py-0.5 px-2 rounded">
                  Exclusivo
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-luxury-black font-semibold tracking-wide">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              {product.salePrice !== null ? (
                <>
                  <span className="font-serif text-3xl text-red-600 font-bold">
                    S/ {product.salePrice.toFixed(2)}
                  </span>
                  <span className="font-sans text-sm line-through text-luxury-black/40">
                    S/ {product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-serif text-3xl text-[#F46261] font-bold">
                  S/ {product.price.toFixed(2)}
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-luxury-black/60 leading-relaxed font-light">
              {product.description}
            </p>
            <div className="flex items-center gap-1.5 font-sans text-[11px]">
              <span className="font-semibold text-luxury-black/40">Disponibilidad:</span>
              <span className={isOutOfStock ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                {isOutOfStock ? 'Agotado' : `${product.stock} unidades listas`}
              </span>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-white/10" />

          {/* DEDICATORIA CARD CUSTOMIZER (Premium UI Feature) */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm tracking-widest text-luxury-black uppercase font-bold flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#F46261]" /> Personaliza tu Dedicatoria
            </h3>
            <p className="font-sans text-[10px] text-luxury-black/50">
              Incluye un mensaje especial en una tarjeta exclusiva sellada artesanalmente sin costo adicional.
            </p>

            {/* Template Selector */}
            <div className="flex gap-2">
              {cardTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setCardStyle(tmpl.id)}
                  className={`px-3 py-2 text-[10px] font-semibold tracking-widest uppercase border rounded transition-all cursor-pointer ${
                    cardStyle === tmpl.id ? 'border-[#F46261] bg-[#F46261]/10 text-[#F46261]' : 'border-neutral-200 hover:border-[#F46261]/50'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] block font-bold">De:</label>
                <input
                  type="text"
                  placeholder="Tu Nombre / Anónimo"
                  value={cardSender}
                  onChange={(e) => setCardSender(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] block font-bold">Para:</label>
                <input
                  type="text"
                  placeholder="Nombre de quien recibe"
                  value={cardRecipient}
                  onChange={(e) => setCardRecipient(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] block font-bold">Dedicatoria (Mensaje):</label>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Escribe tu dedicatoria..."
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all resize-none"
              />
              <span className="text-[9px] text-right block text-[#111111]/70 font-semibold">
                {cardMessage.length}/300 caracteres
              </span>
            </div>

            {/* Live Gift Card Preview Mock */}
            {(cardSender || cardRecipient || cardMessage) && (
              <div className={`p-4 border rounded-lg shadow-sm ${
                cardTemplates.find(t => t.id === cardStyle)?.classes
              } text-xs tracking-wider animate-fadeIn space-y-2`}>
                <div className="flex justify-between border-b pb-1 border-current opacity-30 text-[9px]">
                  <span>TARJETA DEDICATORIA</span>
                  <span>PREVIEW</span>
                </div>
                <div>
                  {cardRecipient && <p className="font-semibold">Querido(a): {cardRecipient}</p>}
                  {cardMessage && <p className="italic my-2 whitespace-pre-line leading-relaxed">"{cardMessage}"</p>}
                  {cardSender && <p className="text-right">Con cariño: {cardSender}</p>}
                </div>
              </div>
            )}
          </div>

          <hr className="border-neutral-200 dark:border-white/10" />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-1 bg-[var(--background)] sm:w-32">
              <button
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => q - 1)}
                className="w-10 py-2 text-sm text-luxury-black disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F46261] transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-sans font-bold text-sm text-luxury-black">{quantity}</span>
              <button
                disabled={quantity >= product.stock || isOutOfStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 py-2 text-sm text-luxury-black disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#F46261] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 uppercase font-sans text-xs tracking-widest font-bold rounded shadow-lg transition-all cursor-pointer ${
                isAdded
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-100'
                  : isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#F46261] to-[#FF8C8C] text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={16} /> ¡Agregado al Carrito!
                </>
              ) : isOutOfStock ? (
                'Sin Stock Temporal'
              ) : (
                <>
                  <ShoppingBag size={16} /> Agregar al Carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-gold-400/10">
          <div className="text-left space-y-2">
            <span className="font-sans text-[10px] tracking-widest uppercase font-bold text-gold-600">Recomendaciones</span>
            <h2 className="font-serif text-2xl text-luxury-black font-semibold tracking-wide">Productos Relacionados</h2>
            <div className="w-12 h-0.5 bg-gold-400 mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((prod) => {
              const hasOffer = prod.salePrice !== null;
              return (
                <div key={prod.id} className="group flex flex-col border border-gold-400/10 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow bg-[var(--background)]">
                  <div className="relative aspect-square overflow-hidden bg-[var(--luxury-cream)]">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="font-sans text-[9px] tracking-wider uppercase text-gold-600 font-bold block mb-1">
                        {prod.category}
                      </span>
                      <h3 className="font-serif text-sm text-luxury-black font-semibold line-clamp-1 group-hover:text-gold-500 transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gold-400/5">
                      <div className="flex flex-col">
                        {hasOffer ? (
                          <>
                            <span className="font-serif text-sm text-luxury-black font-bold">
                              S/ {prod.salePrice!.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-serif text-sm text-luxury-black font-bold">
                            S/ {prod.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/product/${prod.id}`}
                        className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-600 hover:text-gold-800 transition-colors"
                      >
                        Ver más
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
