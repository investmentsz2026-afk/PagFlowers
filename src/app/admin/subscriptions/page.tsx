'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Search, Filter, Eye, Trash2, X, Check, Save, 
  Download, AlertCircle, FileText, CheckCircle2, PauseCircle, XCircle 
} from 'lucide-react';

interface Subscription {
  id: number;
  subNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  planName: string;
  frequency: string;
  flowerPreference: string;
  customDetails: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentReceipt: string | null;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Detail Modal / Panel state
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  
  // Feedback alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load subscriptions
  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      } else {
        showFeedback('error', 'No se pudieron cargar las suscripciones.');
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenDetail = (sub: Subscription) => {
    setSelectedSub(sub);
    setEditStatus(sub.status);
    setEditPaymentStatus(sub.paymentStatus);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSub) return;
    setIsUpdating(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/subscriptions/${selectedSub.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          paymentStatus: editPaymentStatus
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSubscriptions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelectedSub(updated);
        showFeedback('success', 'Suscripción actualizada correctamente.');
      } else {
        showFeedback('error', 'Error al actualizar la suscripción.');
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Error de conexión.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta suscripción?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        setSelectedSub(null);
        showFeedback('success', 'Suscripción eliminada con éxito.');
      } else {
        showFeedback('error', 'No se pudo eliminar la suscripción.');
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Error de conexión.');
    }
  };

  // Helper: Download Base64 attachment
  const handleDownloadAttachment = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search logic
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.subNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.clientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fadeIn text-neutral-100 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-800/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <CalendarCheck className="text-gold-400" /> Control de Suscripciones
          </h1>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
            Gestión y Control de Planes de Flores Recurrentes
          </p>
        </div>
        <div className="bg-neutral-950 px-4 py-2 border border-gold-800/10 rounded-lg text-xs">
          Total Activas:{' '}
          <strong className="text-gold-400 font-bold">
            {subscriptions.filter(s => s.status === 'ACTIVE').length}
          </strong>
        </div>
      </div>

      {/* Feedback alerts */}
      {feedback && (
        <div className={`p-4 border rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-950/20 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle size={16} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3.5 top-3.5 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, celular o código de suscripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold-800/10 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500 text-xs outline-none focus:border-gold-400 transition-all font-medium"
          />
        </div>
        <div className="md:col-span-4 relative">
          <Filter className="absolute left-3.5 top-3.5 text-neutral-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gold-800/10 bg-neutral-950 text-neutral-100 text-xs outline-none focus:border-gold-400 transition-all font-semibold cursor-pointer appearance-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="PAUSED">Pausadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main List Table */}
        <div className={`bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow ${
          selectedSub ? 'lg:col-span-7' : 'lg:col-span-12'
        }`}>
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-gold-400/20 border-t-gold-400 rounded-full animate-spin mx-auto" />
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Cargando suscripciones...</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-neutral-400">
              <CalendarCheck size={36} className="mx-auto text-neutral-600 mb-2" />
              <p className="font-serif text-sm">No se encontraron suscripciones.</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Prueba con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-900 border-b border-gold-800/15 text-[10px] uppercase tracking-wider text-gold-400 font-bold">
                    <th className="py-4 px-6">Código</th>
                    <th className="py-4 px-6">Cliente</th>
                    <th className="py-4 px-6">Plan / Frecuencia</th>
                    <th className="py-4 px-6">Pago</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredSubscriptions.map((sub) => {
                    const isSelected = selectedSub?.id === sub.id;
                    return (
                      <tr 
                        key={sub.id} 
                        className={`hover:bg-neutral-900/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-neutral-900' : ''
                        }`}
                        onClick={() => handleOpenDetail(sub)}
                      >
                        <td className="py-4 px-6 font-mono font-bold">{sub.subNumber}</td>
                        <td className="py-4 px-6">
                          <span className="font-bold block text-white">{sub.clientName}</span>
                          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">{sub.clientPhone}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-white block">{sub.planName}</span>
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mt-0.5">
                            {sub.frequency === 'SEMANAL' ? 'Semanal' : sub.frequency === 'QUINCENAL' ? 'Quincenal' : 'Mensual'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-[10px] block">{sub.paymentMethod}</span>
                          <span className={`inline-block text-[9px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full ${
                            sub.paymentStatus === 'PAID'
                              ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/15'
                              : 'bg-red-950/30 text-red-400 border border-red-500/15'
                          }`}>
                            {sub.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            sub.status === 'ACTIVE'
                              ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                              : sub.status === 'PAUSED'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50'
                          }`}>
                            {sub.status === 'ACTIVE' && <CheckCircle2 size={10} />}
                            {sub.status === 'PAUSED' && <PauseCircle size={10} />}
                            {sub.status === 'CANCELLED' && <XCircle size={10} />}
                            {sub.status === 'ACTIVE' ? 'ACTIVO' : sub.status === 'PAUSED' ? 'PAUSADO' : 'CANCELADO'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(sub);
                            }}
                            className="p-2 text-neutral-400 hover:text-gold-400 bg-neutral-900 border border-gold-800/5 hover:border-gold-400/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Subscription Detail Side Panel */}
        {selectedSub && (
          <div className="lg:col-span-5 bg-neutral-950 border border-gold-500/20 rounded-xl p-6 space-y-6 shadow-xl animate-slideIn">
            
            {/* Header Detail */}
            <div className="flex justify-between items-start border-b border-gold-800/10 pb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">
                  Detalle Suscripción
                </h3>
                <span className="font-mono text-xs text-gold-400 font-bold block mt-1">
                  {selectedSub.subNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-100 hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-5 text-xs font-sans">
              
              {/* Client Contact card */}
              <div className="p-4 bg-neutral-900 rounded-lg space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Datos del Cliente</span>
                <p className="font-bold text-white text-sm">{selectedSub.clientName}</p>
                <p className="text-neutral-300 font-medium">Celular: <strong className="text-white font-bold">{selectedSub.clientPhone}</strong></p>
                <p className="text-neutral-400">{selectedSub.clientEmail}</p>
              </div>

              {/* Delivery info */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Dirección de Reparto</span>
                <p className="text-white font-medium">{selectedSub.deliveryAddress}</p>
                <span className="text-[10px] text-gold-400 font-bold block">{selectedSub.deliveryDistrict}</span>
              </div>

              {/* Arreglo & Flower preference (Important box) */}
              <div className="p-4 bg-gold-400/5 border border-gold-400/20 rounded-lg space-y-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gold-500 block font-bold">Preferencias Florales</span>
                  <span className="font-serif font-bold text-sm text-white block mt-0.5">{selectedSub.flowerPreference}</span>
                </div>
                {selectedSub.customDetails && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gold-500 block font-bold">Instrucciones Especiales</span>
                    <p className="text-neutral-200 mt-1 italic leading-relaxed whitespace-pre-line bg-neutral-950 p-2.5 rounded border border-gold-800/10">
                      "{selectedSub.customDetails}"
                    </p>
                  </div>
                )}
              </div>

              {/* Attachment / Receipt download */}
              {selectedSub.paymentReceipt ? (
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gold-400" />
                    <span className="text-[10px] font-semibold text-neutral-200">Comprobante de Pago</span>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(selectedSub.paymentReceipt!, `Comprobante-${selectedSub.subNumber}.png`)}
                    className="p-1.5 text-xs text-gold-400 hover:text-[#0a192f] bg-gold-500/10 hover:bg-gold-400 rounded transition-all cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider"
                  >
                    <Download size={12} /> Descargar
                  </button>
                </div>
              ) : selectedSub.paymentMethod !== 'TARJETA' ? (
                <div className="p-3 bg-yellow-950/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Sin comprobante cargado</span>
                </div>
              ) : null}

              {/* Status Update Fields */}
              <div className="grid grid-cols-2 gap-4 border-t border-gold-800/10 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Estado de Pago</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gold-800/15 bg-neutral-900 text-white outline-none focus:border-gold-400 cursor-pointer font-bold"
                  >
                    <option value="PENDING">PENDIENTE</option>
                    <option value="PAID">PAGADO</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Estado del Plan</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gold-800/15 bg-neutral-900 text-white outline-none focus:border-gold-400 cursor-pointer font-bold"
                  >
                    <option value="ACTIVE">ACTIVO</option>
                    <option value="PAUSED">PAUSADO</option>
                    <option value="CANCELLED">CANCELADO</option>
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 border-t border-gold-800/10 pt-4">
                <button
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className="flex-grow py-3 bg-gold-400 hover:bg-gold-500 text-neutral-950 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Save size={14} /> {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => handleDeleteSubscription(selectedSub.id)}
                  className="p-3 bg-red-950/20 hover:bg-red-900 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
