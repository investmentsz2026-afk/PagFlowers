'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.token);
        // Show loading overlay
        setShowLoadingOverlay(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
          router.refresh();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Credenciales inválidas.');
        setShowErrorModal(true);
      }
    } catch (err) {
      setError('Error de conexión. Inténtelo más tarde.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden font-sans px-4">
      {/* Visual background lights */}
      <div className="absolute right-1/4 top-1/4 w-[40rem] h-[40rem] bg-gold-500/10 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute left-1/4 bottom-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite_1s]" />

      <div className="w-full max-w-md z-10 space-y-8 animate-fadeIn">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <img src="/images/logo.png" alt="RossyFlowers" className="w-12 h-12 object-contain" />
          <span className="font-serif text-3xl tracking-widest text-white font-semibold animate-pulse">
            Rossy<span className="text-gold-400 font-light font-sans text-xl tracking-normal">Flowers</span>
          </span>
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold-400 font-medium">Panel de Control</p>
        </div>

        {/* Glassmorphic Panel */}
        <div className="bg-[#111111]/70 backdrop-blur-2xl border border-gold-400/20 shadow-[0_0_50px_rgba(212,175,55,0.05)] rounded-3xl p-8 sm:p-10 space-y-6 relative">
          <div className="flex justify-center">
            <ShieldCheck className="text-gold-400 stroke-[1.2]" size={40} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                Correo Electrónico
              </label>
              <div className="flex items-center border border-gold-400/20 rounded-lg px-3 py-2 bg-black/60 text-white focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400/50 transition-all">
                <Mail className="text-gold-400/40 mr-2 flex-shrink-0" size={16} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-transparent border-none outline-none text-xs py-1.5 placeholder:text-neutral-600 focus:ring-0"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                Contraseña
              </label>
              <div className="flex items-center border border-gold-400/20 rounded-lg px-3 py-2 bg-black/60 text-white focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400/50 transition-all">
                <Lock className="text-gold-400/40 mr-2 flex-shrink-0" size={16} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-none outline-none text-xs py-1.5 placeholder:text-neutral-600 focus:ring-0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-gold-400 hover:bg-gold-500 text-luxury-black font-bold text-xs tracking-widest uppercase rounded-lg shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest text-[#8C8C8C] hover:text-gold-400 transition-colors"
          >
            ← Volver al Sitio de Ventas
          </Link>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-400" />
              </div>
            </div>
            <h3 className="text-white font-serif text-lg font-bold">Credenciales Incorrectas</h3>
            <p className="text-neutral-400 text-xs">{error}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay - Initiating Session */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-lg animate-fadeIn">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle size={28} className="text-gold-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-serif text-xl font-bold tracking-wide animate-pulse">Iniciando Sesión</h3>
              <p className="text-gold-400/60 text-[10px] uppercase tracking-[0.3em]">Preparando tu panel de control...</p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
