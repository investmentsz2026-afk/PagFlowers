'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('sending');
    
    // Format message for WhatsApp
    const phoneNumber = "51999999999"; // Puedes cambiar este número por tu número real de WhatsApp
    const waText = `Hola RossyFlowers 🌹%0A%0A*Mi nombre:* ${name}%0A*Mi correo:* ${email}%0A*Consulta:* ${message}`;
    const waUrl = `https://wa.me/${phoneNumber}?text=${waText}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    }, 500);
  };

  return (
    <div className="glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-2xl" />
      
      {status === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10 space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 text-green-600 mb-2">
            <CheckCircle2 size={40} className="stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-2xl text-luxury-black uppercase tracking-wide">¡Mensaje Recibido!</h3>
          <p className="font-sans text-xs text-luxury-black/60 max-w-sm mx-auto leading-relaxed">
            Hemos recibido su consulta floral. Uno de nuestros conserjes de RossyFlowers se pondrá en contacto con usted en los próximos minutos.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 font-sans text-xs uppercase tracking-widest text-gold-600 hover:text-gold-500 font-semibold underline underline-offset-4"
          >
            Enviar otro mensaje
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="form-name" className="block text-[10px] uppercase tracking-widest text-[#111111] font-bold font-sans">
              Nombre Completo
            </label>
            <input
              id="form-name"
              type="text"
              required
              disabled={status === 'sending'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Jhosep Silva"
              className="w-full px-4 py-3 rounded bg-white/80 border border-[#2B1210]/35 text-xs font-sans text-[#111111] placeholder:text-[#2B1210]/55 focus:outline-none focus:border-gold-500 focus:bg-white transition-all duration-300 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="form-email" className="block text-[10px] uppercase tracking-widest text-[#111111] font-bold font-sans">
              Correo Electrónico
            </label>
            <input
              id="form-email"
              type="email"
              required
              disabled={status === 'sending'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. jhosep@correo.com"
              className="w-full px-4 py-3 rounded bg-white/80 border border-[#2B1210]/35 text-xs font-sans text-[#111111] placeholder:text-[#2B1210]/55 focus:outline-none focus:border-gold-500 focus:bg-white transition-all duration-300 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="form-message" className="block text-[10px] uppercase tracking-widest text-[#111111] font-bold font-sans">
              ¿Cuál es la ocasión o idea floral?
            </label>
            <textarea
              id="form-message"
              required
              disabled={status === 'sending'}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos qué tienes en mente, la fecha del evento o si necesitas un diseño exclusivo a medida..."
              className="w-full px-4 py-3 rounded bg-white/80 border border-[#2B1210]/35 text-xs font-sans text-[#111111] placeholder:text-[#2B1210]/55 focus:outline-none focus:border-gold-500 focus:bg-white transition-all duration-300 resize-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-4 bg-[#111111] text-white hover:bg-gold-500 hover:text-white uppercase tracking-widest text-xs font-semibold rounded transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {status === 'sending' ? (
              <span>Enviando...</span>
            ) : (
              <>
                Enviar Mensaje <Send size={12} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
