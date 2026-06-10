'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, X, ShieldAlert, CheckCircle, XCircle, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create/Edit form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'worker', status: 'ACTIVE' });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'toggle' | 'delete';
    user: User | null;
  }>({ show: false, type: 'toggle', user: null });

  // Feedback modal state  
  const [feedbackModal, setFeedbackModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const getAuthHeaders = (extra?: Record<string, string>) => {
    const token = localStorage.getItem('admin_token');
    return { ...(token ? { 'Authorization': `Bearer ${token}` } : {}), ...extra };
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackModal({ show: true, type, message });
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.status === 403) {
        setError('Acceso denegado. Solo los administradores pueden ver esta página.');
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name || '', email: user.email, password: '', role: user.role, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'worker', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadUsers();
        showFeedback('success', editingUser ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      } else {
        const data = await res.json();
        showFeedback('error', data.message || 'Error al guardar usuario.');
      }
    } catch (e) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const handleToggleStatus = (user: User) => {
    setConfirmModal({ show: true, type: 'toggle', user });
  };

  const handleDeleteUser = (user: User) => {
    setConfirmModal({ show: true, type: 'delete', user });
  };

  const confirmAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;
    setConfirmModal({ show: false, type: 'toggle', user: null });

    try {
      if (type === 'toggle') {
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const res = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          loadUsers();
          showFeedback('success', `Usuario ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'} correctamente.`);
        } else {
          const data = await res.json();
          showFeedback('error', data.message || 'Error al cambiar estado.');
        }
      } else if (type === 'delete') {
        const res = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          loadUsers();
          showFeedback('success', 'Usuario eliminado correctamente.');
        } else {
          const data = await res.json();
          showFeedback('error', data.message || 'Error al eliminar usuario.');
        }
      }
    } catch (e) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <ShieldAlert size={64} className="text-red-500/50 mb-4" />
        <h2 className="text-xl text-white font-bold mb-2">Acceso Restringido</h2>
        <p className="text-neutral-400 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Gestión de Usuarios</h1>
          <p className="text-xs text-neutral-400 mt-1">Administra accesos y trabajadores de la tienda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-bold uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-2"
        >
          <UserPlus size={16} /> Agregar Usuario
        </button>
      </div>

      <div className="bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900 text-[10px] uppercase tracking-widest text-[#8C8C8C] border-b border-gold-800/10">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-800/5 text-neutral-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.name || 'Sin Nombre'}</p>
                      <p className="text-[10px] text-neutral-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-950/50 text-purple-400 border border-purple-800/30' : 'bg-blue-950/50 text-blue-400 border border-blue-800/30'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : 'Trabajador'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${
                        u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 text-neutral-400 hover:text-gold-400 transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 transition-colors ${u.status === 'ACTIVE' ? 'text-orange-400/50 hover:text-orange-400' : 'text-green-400/50 hover:text-green-400'}`}
                          title={u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        >
                          {u.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-gold-800/10">
              <h3 className="font-serif font-bold text-white tracking-wide">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">
                  Contraseña {editingUser && <span className="text-neutral-600">(Dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Rol</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                  >
                    <option value="worker">Trabajador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 mb-1 font-semibold">Estado</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-neutral-900 border border-gold-800/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-bold uppercase tracking-wider text-xs rounded transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRM ACTION MODAL ==================== */}
      {confirmModal.show && confirmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                confirmModal.type === 'delete' 
                  ? 'bg-red-950/40 border border-red-500/30' 
                  : 'bg-amber-950/40 border border-amber-500/30'
              }`}>
                {confirmModal.type === 'delete' 
                  ? <Trash2 size={32} className="text-red-400" />
                  : <AlertTriangle size={32} className="text-amber-400" />
                }
              </div>
            </div>
            <h3 className="text-white font-serif text-lg font-bold">
              {confirmModal.type === 'delete' ? '¿Eliminar Usuario?' : 
                confirmModal.user.status === 'ACTIVE' ? '¿Desactivar Usuario?' : '¿Activar Usuario?'}
            </h3>
            <p className="text-neutral-400 text-xs">
              {confirmModal.type === 'delete' 
                ? `¿Estás seguro de que deseas eliminar a "${confirmModal.user.name || confirmModal.user.email}"? Esta acción no se puede deshacer.`
                : confirmModal.user.status === 'ACTIVE'
                  ? `¿Estás seguro de que deseas desactivar a "${confirmModal.user.name || confirmModal.user.email}"? No podrá iniciar sesión.`
                  : `¿Deseas reactivar a "${confirmModal.user.name || confirmModal.user.email}"?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, type: 'toggle', user: null })}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300'
                }`}
              >
                {confirmModal.type === 'delete' ? 'Sí, Eliminar' : 'Sí, Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FEEDBACK MODAL (SUCCESS / ERROR) ==================== */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`bg-neutral-950 border rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl ${
            feedbackModal.type === 'success' ? 'border-green-800/30' : 'border-red-800/30'
          }`}>
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                feedbackModal.type === 'success' 
                  ? 'bg-green-950/40 border border-green-500/30' 
                  : 'bg-red-950/40 border border-red-500/30'
              }`}>
                {feedbackModal.type === 'success' 
                  ? <CheckCircle size={32} className="text-green-400" />
                  : <AlertCircle size={32} className="text-red-400" />
                }
              </div>
            </div>
            <h3 className="text-white font-serif text-lg font-bold">
              {feedbackModal.type === 'success' ? '¡Éxito!' : 'Error'}
            </h3>
            <p className="text-neutral-400 text-xs">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ show: false, type: 'success', message: '' })}
              className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                feedbackModal.type === 'success'
                  ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300'
                  : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
