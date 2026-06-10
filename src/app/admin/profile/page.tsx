'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle, Lock, Save, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/auth/me', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ name: data.user.name || '', email: data.user.email, role: data.user.role });
        }
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado con éxito.' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-2xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Mi Perfil</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Actualiza tu información personal y credenciales de acceso.
          {user.role === 'worker' && ' (Rol: Trabajador)'}
          {user.role === 'admin' && ' (Rol: Administrador)'}
        </p>
      </div>

      <div className="bg-neutral-950 border border-gold-800/20 rounded-xl p-6 md:p-8 shadow-sm">
        {message.text && (
          <div className={`p-4 mb-6 rounded flex items-start gap-3 text-xs ${message.type === 'success' ? 'bg-green-950/40 text-green-400 border border-green-800/30' : 'bg-red-950/40 text-red-400 border border-red-800/30'}`}>
            <AlertCircle size={16} className="shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-widest flex items-center gap-2 border-b border-gold-800/20 pb-2">
              <UserCircle size={16} /> Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Nombre Completo</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-widest flex items-center gap-2 border-b border-gold-800/20 pb-2">
              <Lock size={16} /> Seguridad
            </h3>
            <p className="text-[10px] text-neutral-500">Deja estos campos en blanco si no deseas cambiar tu contraseña.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t border-gold-800/10">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-luxury-black font-bold uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
