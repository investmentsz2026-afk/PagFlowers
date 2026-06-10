'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Trash2, ArrowRight, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalog' },
    { name: 'Nuestra Historia', path: '/#nosotros' },
    { name: 'Contacto', path: '/#contacto' },
    { name: 'Rastrear Pedido', path: '/track' },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: '-150%' }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto w-[92%] sm:w-[96%] max-w-7xl glass-nav rounded-2xl shadow-xl border border-white/20 dark:border-white/10 print:hidden transform-gpu will-change-transform"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <img
                  src="/images/logo.png"
                  alt="RossyFlowers"
                  className="w-10 h-10 object-contain"
                />
                <span translate="no" className="notranslate font-serif text-2xl sm:text-3xl tracking-widest text-luxury-black font-semibold group-hover:text-gold-500 transition-colors">
                  Rossy<span className="text-gold-400 font-light font-sans text-xl tracking-normal">Flowers</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`font-sans text-sm tracking-widest uppercase transition-colors hover:text-gold-500 py-2 ${
                      isActive ? 'text-gold-500 font-medium border-b border-gold-400' : 'text-luxury-black/70'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Utility Icons */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Admin Panel Link */}
              <Link
                href="/admin/login"
                className="hidden lg:inline-block font-sans text-xs tracking-widest uppercase text-luxury-black/50 hover:text-gold-500 transition-colors"
              >
                CPanel
              </Link>

              {/* Theme Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.9, rotate: 15 }}
                onClick={toggleTheme}
                className="p-2 text-luxury-black hover:text-gold-500 transition-colors focus:outline-none cursor-pointer flex items-center justify-center overflow-hidden"
                aria-label="Cambiar Tema"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ y: -12, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 12, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    {theme === 'light' ? (
                      <Moon size={20} className="stroke-[1.5]" />
                    ) : (
                      <Sun size={20} className="stroke-[1.5]" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 text-luxury-black hover:text-gold-500 transition-colors focus:outline-none"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag size={24} className="stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-luxury-black hover:text-gold-500 transition-colors focus:outline-none"
                aria-label="Menu principal"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              />

              {/* Drawer container */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-[var(--luxury-cream)] shadow-2xl flex flex-col h-full border-r border-gold-400/20 md:hidden"
              >
                {/* Drawer Header */}
                <div className="px-6 py-6 border-b border-gold-400/10 flex items-center justify-between bg-[var(--background)]">
                  <span className="font-serif text-xl tracking-widest text-luxury-black font-semibold">
                    MENÚ
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-luxury-black/60 hover:text-gold-500 transition-colors focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Drawer Links */}
                <div className="px-4 pt-6 pb-6 space-y-2 overflow-y-auto flex-1 bg-[var(--background)]">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-4 font-sans text-sm tracking-widest uppercase text-luxury-black/80 hover:bg-gold-50/50 hover:text-gold-500 rounded-lg transition-all"
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <div className="pt-6 mt-6 border-t border-gold-400/10">
                    <Link
                      href="/admin/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-4 font-sans text-xs tracking-widest uppercase text-gold-600 hover:bg-gold-50/50 rounded-lg transition-all"
                    >
                      Panel de Administración
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Slider container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[var(--luxury-cream)] shadow-2xl flex flex-col h-full border-l border-gold-400/20"
            >
              {/* Drawer Header */}
              <div className="px-6 py-6 border-b border-gold-400/10 flex items-center justify-between">
                <h2 className="font-serif text-xl text-luxury-black tracking-widest">SU COMPRA</h2>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 text-luxury-black/60 hover:text-gold-500 transition-colors focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body (Items list) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={64} className="text-gold-400/30 stroke-[1] mb-4" />
                    <p className="font-serif text-lg text-luxury-black/70 mb-2">Su carrito de compras está vacío</p>
                    <p className="font-sans text-xs text-luxury-black/40 max-w-xs mb-6">
                      Explore nuestras exclusivas colecciones florales y elija el regalo perfecto.
                    </p>
                    <Link
                      href="/catalog"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="inline-block px-6 py-3 bg-[#111111] text-white uppercase tracking-widest text-xs font-semibold hover:bg-gold-500 transition-all rounded-md"
                    >
                      Ir al Catálogo
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => {
                    const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                    return (
                      <div key={item.id} className="flex gap-4 border-b border-gold-400/10 pb-4">
                        <div className="relative w-20 h-20 rounded bg-[var(--background)] overflow-hidden border border-gold-400/10 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-sm text-luxury-black font-semibold line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="font-sans text-xs text-gold-600 font-semibold mt-1">
                              S/ {activePrice.toFixed(2)}
                              {item.salePrice !== null && (
                                <span className="line-through text-luxury-black/30 text-[10px] ml-2 font-normal">
                                  S/ {item.price.toFixed(2)}
                                </span>
                              )}
                            </p>
                            {item.cardMessage && (
                              <p className="text-[10px] italic text-luxury-black/50 line-clamp-1 mt-1">
                                Tarjeta: "{item.cardMessage}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gold-400/20 rounded bg-[var(--background)]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-xs text-luxury-black hover:text-gold-500"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-sans font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-xs text-luxury-black hover:text-gold-500"
                              >
                                +
                              </button>
                            </div>
                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-luxury-black/30 hover:text-red-500 transition-colors"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer (Summary & CTA) */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gold-400/20 bg-[var(--luxury-cream)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-sans text-xs uppercase tracking-widest text-luxury-black/60">Subtotal</span>
                    <span className="font-serif text-lg text-luxury-black font-semibold">S/ {cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-luxury-black/40 mb-6 font-sans">
                    * Costo de envío y descuentos se calcularán en el checkout.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/cart"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="block text-center py-3 border border-luxury-black text-luxury-black hover:bg-gold-50/50 uppercase tracking-widest text-[10px] font-semibold transition-all rounded"
                    >
                      Ver Carrito
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="block text-center py-3 bg-[#111111] text-white hover:bg-gold-500 uppercase tracking-widest text-[10px] font-semibold transition-all rounded flex items-center justify-center gap-2"
                    >
                      Comprar <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
