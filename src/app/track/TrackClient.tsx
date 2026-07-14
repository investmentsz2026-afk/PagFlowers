'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle2, Package, Truck, Gift, ChevronRight, XCircle } from 'lucide-react';
import CurvedLoop from '@/components/ui/CurvedLoop';

interface TrackingData {
  orderNumber: string;
  clientName: string;
  status: string; // PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED
  deliveryDate: string;
  deliveryTime: string;
  deliveryDistrict: string;
}

const STEPS = [
  { id: 'PENDING', label: 'Pendiente', icon: Clock, desc: 'Recibimos tu pedido' },
  { id: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle2, desc: 'Pago verificado' },
  { id: 'PREPARING', label: 'Preparando', icon: Package, desc: 'Diseño floral en proceso' },
  { id: 'SHIPPED', label: 'En Reparto', icon: Truck, desc: 'En camino a destino' },
  { id: 'DELIVERED', label: 'Entregado', icon: Gift, desc: 'Entregado con éxito' },
];

export default function TrackClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const formattedNumber = orderNumber.trim().toUpperCase();
      const res = await fetch(`/api/track/${formattedNumber}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No se encontró ningún pedido con ese código.');
        }
        throw new Error('Error al buscar el pedido. Intenta nuevamente.');
      }

      const data = await res.json();
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || 'Error al buscar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  // Determine current step index
  const currentStepIndex = trackingData 
    ? STEPS.findIndex(s => s.id === trackingData.status)
    : -1;

  return (
    <div className="relative min-h-screen bg-[var(--background)] overflow-hidden pt-32 pb-24">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-400/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Title */}
        <div className="text-center space-y-4 mb-12">
          <span className="font-sans text-xs tracking-[0.4em] text-gold-500 uppercase font-bold drop-shadow-sm">
            Estado de tu orden
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-luxury-black tracking-wide">
            Seguimiento de Pedido
          </h1>
          <p className="font-sans text-sm text-luxury-black/60 max-w-lg mx-auto">
            Ingresa tu código de orden (ej. PF-2026-909438) para conocer en tiempo real el estado de tu arreglo floral.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 relative">
          <div className="relative flex items-center bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#2B1210]/35 dark:border-white/10 rounded-full shadow-lg p-2 transition-all focus-within:shadow-[0_10px_30px_rgba(212,175,55,0.15)] focus-within:border-gold-400">
            <Search className="text-gold-500 ml-4 mr-2" size={24} />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ej. PF-2026-909438"
              className="w-full bg-transparent border-none outline-none font-sans text-base py-3 placeholder:text-[#2B1210]/55 dark:placeholder:text-slate-400 text-[#111111] dark:text-white font-semibold"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F46261] hover:bg-gold-500 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-sans text-sm tracking-widest uppercase font-bold dark:hover:bg-gold-500 dark:hover:text-white transition-colors flex-shrink-0 disabled:opacity-50 shadow-md"
            >
              {loading ? 'Buscando...' : 'Rastrear'}
            </button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Tracking Results */}
        <AnimatePresence>
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--luxury-cream)] dark:bg-[#1A1A1A]/60 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-[var(--luxury-rose)]/20 dark:border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                 <Package size={200} />
              </div>

              {/* Order Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--luxury-rose)]/20 dark:border-white/10 pb-8 mb-10 gap-6 relative z-10">
                <div>
                  <h2 className="font-sans text-sm tracking-widest text-gold-500 font-bold mb-1 uppercase">
                    ORDEN ENCONTRADA
                  </h2>
                  <p className="font-serif text-2xl sm:text-3xl text-luxury-black font-bold">
                    {trackingData.orderNumber}
                  </p>
                  <p className="font-sans text-sm text-luxury-black/60 mt-1">
                    A nombre de: <span className="font-medium text-luxury-black">{trackingData.clientName}</span>
                  </p>
                </div>
                <div className="bg-[var(--background)] px-6 py-4 rounded-2xl border border-[var(--luxury-rose)]/25 dark:border-white/10 shadow-sm text-left sm:text-right">
                   <p className="font-sans text-xs tracking-widest text-luxury-black/50 uppercase font-semibold mb-1">
                     Entrega Programada
                   </p>
                   <p className="font-serif text-lg text-luxury-black font-semibold">
                     {new Date(trackingData.deliveryDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
                   </p>
                   <p className="font-sans text-sm text-gold-600 font-medium">
                     {trackingData.deliveryTime} • {trackingData.deliveryDistrict}
                   </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative gap-8 sm:gap-0">
                  
                  {/* Background connecting line (Desktop) */}
                  <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-[var(--luxury-rose)]/30 dark:bg-white/10 rounded-full z-0" />
                  
                  {/* Active connecting line (Desktop) */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="hidden sm:block absolute top-6 left-12 h-1 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full z-0" 
                  />

                  {/* Background connecting line (Mobile) */}
                  <div className="sm:hidden absolute top-8 bottom-8 left-6 w-1 bg-[var(--luxury-rose)]/30 dark:bg-white/10 rounded-full z-0" />
                  
                  {/* Active connecting line (Mobile) */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="sm:hidden absolute top-8 left-6 w-1 bg-gradient-to-b from-gold-400 to-gold-500 rounded-full z-0" 
                  />

                  {STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 w-full sm:w-1/5 text-left sm:text-center group">
                        
                        {/* Circle Indicator */}
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.15 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 shadow-md transition-all duration-500 ${
                            isCurrent 
                              ? 'bg-gold-500 border-[var(--luxury-cream)] dark:border-[#1A1A1A] text-white shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110' 
                              : isCompleted 
                                ? 'bg-gold-400 border-[var(--luxury-cream)] dark:border-[#1A1A1A] text-white' 
                                : 'bg-[var(--luxury-cream)] dark:bg-[#2A2A2A] border-[var(--luxury-cream)] dark:border-[#1A1A1A] text-luxury-black/40 dark:text-slate-500'
                          }`}
                        >
                          <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                        </motion.div>
                        
                        {/* Text */}
                        <div className="mt-0 sm:mt-2">
                          <p className={`font-sans text-sm font-bold tracking-wide uppercase transition-colors ${
                            isCurrent ? 'text-gold-600 dark:text-gold-400' : isCompleted ? 'text-luxury-black' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {step.label}
                          </p>
                          <p className={`font-sans text-[10px] sm:text-xs mt-0.5 max-w-[120px] mx-auto ${
                            isCurrent ? 'text-luxury-black/80 font-medium' : isCompleted ? 'text-luxury-black/60' : 'text-slate-400/60 dark:text-slate-500/60'
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-12 text-center bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800/30 rounded-2xl p-6 relative z-10">
                <p className="font-serif text-xl sm:text-2xl text-luxury-black font-semibold mb-2">
                  {currentStepIndex === 0 && "Hemos recibido tu solicitud"}
                  {currentStepIndex === 1 && "Pago confirmado correctamente"}
                  {currentStepIndex === 2 && "Nuestros floristas están creando tu diseño"}
                  {currentStepIndex === 3 && "¡Tu pedido va en camino!"}
                  {currentStepIndex === 4 && "¡Pedido entregado con éxito!"}
                </p>
                <p className="font-sans text-sm text-luxury-black/70">
                  {currentStepIndex === 0 && "Estamos validando el pago para comenzar la preparación."}
                  {currentStepIndex === 1 && "Tu pedido está listo para pasar al taller floral."}
                  {currentStepIndex === 2 && "Cuidamos cada detalle para que tu regalo sea perfecto."}
                  {currentStepIndex === 3 && `Llegará a ${trackingData.deliveryDistrict} en el horario de ${trackingData.deliveryTime}.`}
                  {currentStepIndex === 4 && "Esperamos que haya sido una experiencia inolvidable. ¡Gracias por confiar en RossyFlowers!"}
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
