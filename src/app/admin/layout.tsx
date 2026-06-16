'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  UserCircle,
  Shield,
  AlertTriangle,
  Truck,
  Tags
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Login page → no auth needed, render directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // All other admin pages → require auth
  return <AuthenticatedAdmin>{children}</AuthenticatedAdmin>;
}

function AuthenticatedAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          setStatus('authenticated');
        } else {
          // Token is invalid, clean up
          localStorage.removeItem('admin_token');
          fetch('/api/auth/logout', { method: 'POST' }); // Clear httpOnly cookie
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  // LOADING state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin mx-auto" />
          <p className="text-gold-400/60 text-[10px] uppercase tracking-[0.3em]">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // NOT AUTHENTICATED → clear cookie and go to login
  if (status === 'unauthenticated') {
    return <AutoRedirectToLogin />;
  }

  // AUTHENTICATED → show admin panel
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    
    // Clear everything properly
    localStorage.removeItem('admin_token');
    await fetch('/api/auth/logout', { method: 'POST' }); // Clear httpOnly cookie
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Productos', path: '/admin/products', icon: <ShoppingBag size={18} /> },
    { name: 'Categorías', path: '/admin/categories', icon: <Tags size={18} /> },
    { name: 'Pedidos', path: '/admin/orders', icon: <Receipt size={18} /> },
    { name: 'Zonas de Envío', path: '/admin/delivery', icon: <Truck size={18} /> },
    { name: 'Clientes', path: '/admin/clients', icon: <Users size={18} /> },
    { name: 'Contenido', path: '/admin/content', icon: <Settings size={18} /> },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Usuarios', path: '/admin/users', icon: <Shield size={18} /> });
  }
  menuItems.push({ name: 'Mi Perfil', path: '/admin/profile', icon: <UserCircle size={18} /> });

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-neutral-950 border-b border-gold-800/10 px-4 py-4 flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg tracking-widest text-white">
          <img src="/images/logo.png" alt="RossyFlowers" className="w-6 h-6 object-contain" />
          <span>RossyFlowers</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-neutral-400 hover:text-gold-400 focus:outline-none"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Admin Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-64 bg-neutral-950 border-r border-gold-800/15 flex flex-col justify-between transition-transform duration-300 transform md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shrink-0`}
      >
        <div className="flex-grow py-8 px-6 space-y-8 overflow-y-auto">
          {/* Brand Logo */}
          <div className="border-b border-gold-800/10 pb-6 text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start font-serif text-xl tracking-widest text-white font-semibold">
              <img src="/images/logo.png" alt="RossyFlowers" className="w-8 h-8 object-contain" />
              <span>RossyFlowers</span>
            </Link>
            <span className="block text-[8px] tracking-[0.25em] uppercase text-gold-500 font-bold mt-1.5">
              Panel Administrativo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-gold-400 text-luxury-black shadow-md'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gold-800/10 space-y-3">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-900/20 hover:text-gold-300 transition-colors cursor-pointer"
          >
            <Sparkles size={18} />
            <span>Ver Tienda</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-8 md:p-10 bg-neutral-900">
        <div className="max-w-6xl mx-auto animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-5 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle size={32} className="text-amber-400" />
              </div>
            </div>
            <h3 className="text-white font-serif text-lg font-bold">¿Cerrar Sesión?</h3>
            <p className="text-neutral-400 text-xs">¿Estás seguro de que deseas cerrar tu sesión de administrador?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Sí, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logging Out Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-lg animate-fadeIn">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-red-400/20 border-t-red-400 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <LogOut size={28} className="text-red-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-serif text-xl font-bold tracking-wide animate-pulse">Cerrando Sesión</h3>
              <p className="text-red-400/60 text-[10px] uppercase tracking-[0.3em]">Hasta pronto...</p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component to handle redirect — runs once, clears cookie, navigates
function AutoRedirectToLogin() {
  const hasRedirected = React.useRef(false);

  React.useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    // Clear httpOnly cookie via server, then redirect
    fetch('/api/auth/logout', { method: 'POST' })
      .finally(() => {
        window.location.href = '/admin/login';
      });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin mx-auto" />
        <p className="text-gold-400/60 text-[10px] uppercase tracking-[0.3em]">Redirigiendo al login...</p>
      </div>
    </div>
  );
}
