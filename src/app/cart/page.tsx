'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Tag, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface District {
  name: string;
  cost: number;
}

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    discount,
    couponCode,
    applyCoupon,
    deliveryFee,
    setDeliveryFee,
    deliveryDistrict,
    setDeliveryDistrict,
    cartTotal,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);

  // Load districts
  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await fetch('/api/content?key=delivery_districts');
        if (res.ok) {
          const data = await res.json();
          setDistricts(data);
        } else {
          // Static fallback
          setDistricts([
            { name: 'Miraflores', cost: 15 },
            { name: 'San Isidro', cost: 15 },
            { name: 'Santiago de Surco', cost: 18 },
            { name: 'La Molina', cost: 25 },
            { name: 'San Borja', cost: 18 },
            { name: 'Barranco', cost: 15 },
          ]);
        }
      } catch (e) {
        console.error('Failed to load districts in cart page:', e);
      }
    }
    loadDistricts();
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);

    if (!couponInput) return;

    const valid = applyCoupon(couponInput);
    if (valid) {
      setCouponSuccess(true);
      setCouponInput('');
    } else {
      setCouponError('Código de cupón inválido o expirado.');
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setDeliveryDistrict('');
      setDeliveryFee(0);
      return;
    }
    const distObj = districts.find((d) => d.name === val);
    if (distObj) {
      setDeliveryDistrict(distObj.name);
      setDeliveryFee(distObj.cost);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-40 pb-24 text-center space-y-6">
        <div className="flex justify-center">
          <ShoppingBag size={80} className="text-gold-400/20 stroke-[1]" />
        </div>
        <h1 className="font-serif text-3xl text-luxury-black tracking-wide">Carrito de Compras Vacío</h1>
        <p className="font-sans text-sm text-luxury-black/50 max-w-md mx-auto">
          ¿Aún no has decidido qué regalar? Explora nuestras colecciones exclusivas creadas por floristas expertos.
        </p>
        <div className="pt-4">
          <Link
            href="/catalog"
            className="inline-block px-8 py-4 bg-luxury-black text-gold-200 uppercase tracking-widest text-xs font-bold hover:bg-gold-500 hover:text-white transition-all rounded shadow-md"
          >
            Ver Catálogo Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-12">
      {/* 1. Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-black tracking-wide">Carrito de Compras</h1>
        <p className="font-sans text-xs text-luxury-black/50 mt-1">Revisa y finaliza los detalles de tu orden premium.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Items list - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl overflow-hidden shadow-sm">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 bg-luxury-cream/50 p-4 border-b border-gold-400/10 text-xs font-sans uppercase font-bold tracking-widest text-luxury-black/60">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Cart items */}
            <div className="divide-y divide-gold-400/10">
              {cart.map((item) => {
                const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                return (
                  <div
                    key={item.id}
                    className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                  >
                    {/* Column 1: Info (6/12) */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <div className="w-20 h-20 bg-neutral-50 border border-gold-400/10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-serif text-sm sm:text-base text-luxury-black font-semibold">
                          {item.name}
                        </h3>
                        {item.cardMessage && (
                          <p className="text-[10px] italic text-luxury-black/50 leading-relaxed max-w-sm">
                            <span className="font-semibold not-italic">Detalles:</span> "{item.cardMessage}"
                          </p>
                        )}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] uppercase font-sans font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 mt-2 cursor-pointer"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Price (2/12) */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-center font-sans text-xs font-semibold text-luxury-black">
                      <span className="sm:hidden text-luxury-black/40 mr-1.5 uppercase font-medium">Precio:</span>
                      S/ {activePrice.toFixed(2)}
                    </div>

                    {/* Column 3: Quantity (2/12) */}
                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                      <div className="flex items-center border border-gold-400/20 rounded bg-[var(--background)]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-xs text-luxury-black hover:text-gold-500 font-semibold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-sans font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-xs text-luxury-black hover:text-gold-500 font-semibold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Column 4: Total (2/12) */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-serif text-sm font-bold text-luxury-black">
                      <span className="sm:hidden text-luxury-black/40 mr-1.5 uppercase font-sans font-medium text-xs">Total:</span>
                      S/ {(activePrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/catalog"
              className="text-xs uppercase font-sans font-bold text-luxury-black hover:text-gold-500 transition-colors border-b-2 border-luxury-black hover:border-gold-500 pb-1"
            >
              ← Continuar Comprando
            </Link>
            <button
              onClick={() => {
                if(confirm('¿Está seguro de vaciar su carrito?')) {
                  const { clearCart } = useCart();
                  clearCart();
                }
              }}
              className="text-xs uppercase font-sans font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            >
              Vaciar Carrito
            </button>
          </div>
        </div>

        {/* Summary side card - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-lg text-luxury-black tracking-widest">RESUMEN</h2>

            {/* Calculations breakdown */}
            <div className="space-y-4 font-sans text-xs">
              <div className="flex justify-between text-luxury-black/60">
                <span>Subtotal</span>
                <span className="font-bold">S/ {cartSubtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Descuento ({couponCode})
                  </span>
                  <span className="font-bold">- S/ {discount.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery District Select */}
              <div className="space-y-2 pt-2 border-t border-gold-400/5">
                <label className="text-luxury-black/60 block font-semibold">Distrito de Entrega</label>
                <div className="flex items-center gap-1.5 border border-gold-400/20 rounded px-2 bg-luxury-cream/10">
                  <Truck size={14} className="text-gold-500" />
                  <select
                    value={deliveryDistrict}
                    onChange={handleDistrictChange}
                    className="w-full bg-transparent border-none py-2 text-xs outline-none focus:ring-0 text-luxury-black"
                  >
                    <option className="bg-[var(--background)]" value="">Selecciona Distrito...</option>
                    {districts.map((d) => (
                      <option className="bg-[var(--background)]" key={d.name} value={d.name}>
                        {d.name} (+ S/ {d.cost.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between text-luxury-black/60">
                  <span>Envío a {deliveryDistrict}</span>
                  <span className="font-bold">S/ {deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <hr className="border-gold-400/10" />

              <div className="flex justify-between items-center text-luxury-black">
                <span className="text-sm font-bold">TOTAL</span>
                <span className="font-serif text-xl font-bold">S/ {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Código de Descuento (ej: PROMO10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-grow text-xs p-2.5 rounded border border-gold-400/25 bg-[var(--background)] text-luxury-black placeholder:text-luxury-black/30 outline-none uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white text-xs tracking-wider uppercase font-semibold rounded transition-all cursor-pointer"
              >
                Aplicar
              </button>
            </form>
            {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-600 font-bold">¡Cupón aplicado exitosamente!</p>}

            {/* Checkout Link CTA */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white text-xs tracking-widest uppercase font-bold rounded shadow-lg transition-all"
            >
              Proceder al Pago <ArrowRight size={14} />
            </Link>
          </div>

          {/* Secure Purchase Info */}
          <div className="flex items-center gap-3 p-4 bg-[var(--background)] border border-gold-400/10 rounded-xl text-[10px] font-sans text-luxury-black/50">
            <ShieldCheck size={28} className="text-gold-400 flex-shrink-0" />
            <p>
              Compra 100% Segura. Encriptación SSL y protección de datos. Pagos seguros mediante Yape, Plin o Tarjetas de Crédito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
