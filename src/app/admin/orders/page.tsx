'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Calendar, Clock, MapPin, MessageSquare, ClipboardList, Check, CheckCircle, AlertCircle } from 'lucide-react';

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  cardMessage: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryDate: string;
  deliveryTime: string;
  cardMessage: string | null;
  total: number;
  deliveryFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReceipt: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackModal({ show: true, type, message });
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      // Fetch orders
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders in admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Update list
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
        // Update expanded details if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: updated.status } : null);
        }
        showFeedback('success', 'Estado del pedido actualizado.');
      } else {
        showFeedback('error', 'Error al actualizar el estado.');
      }
    } catch (e) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const handleUpdatePayment = async (orderId: number, newPaymentStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: updated.paymentStatus } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, paymentStatus: updated.paymentStatus } : null);
        }
        showFeedback('success', 'Estado de pago actualizado.');
      } else {
        showFeedback('error', 'Error al actualizar el pago.');
      }
    } catch (e) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-950 text-yellow-300 border border-yellow-800/30';
      case 'CONFIRMED':
        return 'bg-blue-950 text-blue-300 border border-blue-800/30';
      case 'PREPARING':
        return 'bg-purple-950 text-purple-300 border border-purple-800/30';
      case 'SHIPPED':
        return 'bg-orange-950 text-orange-300 border border-orange-800/30';
      case 'DELIVERED':
        return 'bg-green-950 text-green-300 border border-green-800/30';
      default:
        return 'bg-neutral-800 text-neutral-400';
    }
  };

  const statusMap: Record<string, string> = {
    ALL: 'Todos',
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    SHIPPED: 'En Reparto',
    DELIVERED: 'Entregado'
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Gestión de Pedidos</h1>
        <p className="text-xs text-neutral-400 mt-1">Control de envíos, confirmación de pagos y flujo logístico en Lima.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-neutral-950 border border-gold-800/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between shadow-sm">
        {/* Search */}
        <div className="flex items-center border border-gold-800/20 rounded-lg px-3 py-2 bg-neutral-900/60 max-w-md w-full">
          <Search size={16} className="text-neutral-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por código, cliente o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs py-1 placeholder:text-neutral-600 focus:ring-0 text-white"
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex overflow-x-auto pb-1 gap-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-gold-400 border-gold-400 text-neutral-950'
                  : 'bg-neutral-900 border-gold-800/10 text-neutral-400 hover:border-gold-800/30'
              }`}
            >
              {statusMap[st] || st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: left is orders list, right is selected order detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Orders list - 7 cols */}
        <div className="lg:col-span-7 bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando pedidos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500">No se encontraron pedidos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900 text-[10px] uppercase tracking-widest text-[#8C8C8C] border-b border-gold-800/10">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Fecha/Entrega</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-800/5 text-neutral-300">
                  {filtered.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`hover:bg-neutral-900/40 cursor-pointer transition-colors ${
                        selectedOrder?.id === ord.id ? 'bg-gold-400/5 border-l-2 border-gold-400' : ''
                      }`}
                    >
                      <td className="p-4 font-mono text-gold-400 font-bold">
                        {ord.orderNumber}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">
                          {new Date(ord.deliveryDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                        </p>
                        <p className="text-[10px] text-neutral-500">{ord.deliveryTime}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{ord.clientName}</p>
                        <p className="text-[10px] text-neutral-500">{ord.deliveryDistrict}</p>
                      </td>
                      <td className="p-4 font-bold text-white">S/ {ord.total.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                          className="p-1.5 bg-neutral-900 text-gold-400 border border-gold-800/10 rounded hover:bg-gold-500 hover:text-neutral-950 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Order Details Panel - 5 cols */}
        <div className="lg:col-span-5 bg-neutral-950 border border-gold-800/10 rounded-xl p-6 shadow-md space-y-6 min-h-[400px]">
          {selectedOrder ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Info */}
              <div className="border-b border-gold-800/10 pb-4 space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-[#8C8C8C] font-semibold">Detalles de la Orden</span>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-white font-bold">{selectedOrder.orderNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {statusMap[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Registrado el {new Date(selectedOrder.createdAt).toLocaleString('es-ES')}
                </p>
              </div>

              {/* Status Controller selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gold-200/60 block font-semibold">Logística Pedido</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="w-full text-[11px] p-2 bg-neutral-900 border border-gold-800/20 text-white rounded outline-none focus:border-gold-400 cursor-pointer"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="PREPARING">Preparando</option>
                    <option value="SHIPPED">En Reparto</option>
                    <option value="DELIVERED">Entregado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gold-200/60 block font-semibold">Estado de Pago</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleUpdatePayment(selectedOrder.id, e.target.value)}
                    className="w-full text-[11px] p-2 bg-neutral-900 border border-gold-800/20 text-white rounded outline-none focus:border-gold-400 cursor-pointer"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="PAID">Pagado</option>
                  </select>
                </div>
              </div>

              {/* Delivery info */}
              <div className="space-y-3 font-sans text-xs bg-neutral-900/40 p-4 border border-gold-800/5 rounded-xl">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
                  <MapPin size={12} /> Coordinación Envío
                </h4>
                <ul className="space-y-2 text-neutral-300">
                  <li><strong>Destinatario:</strong> {selectedOrder.clientName}</li>
                  <li><strong>Teléfono/WA:</strong> {selectedOrder.clientPhone}</li>
                  <li><strong>Email:</strong> {selectedOrder.clientEmail}</li>
                  <li><strong>Dirección:</strong> {selectedOrder.deliveryAddress}, {selectedOrder.deliveryDistrict}</li>
                  <li className="flex gap-4">
                    <span><strong>Fecha:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</span>
                    <span><strong>Hora:</strong> {selectedOrder.deliveryTime}</span>
                  </li>
                </ul>
              </div>

              {/* Payment Receipt */}
              {selectedOrder.paymentReceipt && (
                <div className="space-y-3 font-sans text-xs bg-neutral-900/40 p-4 border border-gold-800/5 rounded-xl">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
                    <Check size={12} /> Comprobante de Pago Adjunto
                  </h4>
                  <a 
                    href={selectedOrder.paymentReceipt} 
                    download={`comprobante_${selectedOrder.orderNumber}.png`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full sm:w-48 border border-gold-800/20 rounded-lg overflow-hidden hover:opacity-80 transition-opacity shadow-sm cursor-pointer"
                  >
                    <img src={selectedOrder.paymentReceipt} alt="Comprobante" className="w-full h-auto object-cover" />
                  </a>
                  <p className="text-[9px] text-neutral-500 italic">Haga clic en la imagen para ver en tamaño completo.</p>
                </div>
              )}

              {/* Gift Card Message */}
              {selectedOrder.cardMessage && (
                <div className="space-y-2 font-sans text-xs bg-neutral-900/40 p-4 border border-gold-800/5 rounded-xl">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
                    <MessageSquare size={12} /> Mensaje Dedicatoria
                  </h4>
                  <p className="text-neutral-300 italic">"{selectedOrder.cardMessage}"</p>
                </div>
              )}

              {/* Products listing */}
              <div className="space-y-3 font-sans text-xs">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
                  <ClipboardList size={12} /> Artículos ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-gold-800/10 border border-gold-800/10 rounded-xl overflow-hidden bg-neutral-950">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-serif font-bold text-neutral-200">{item.productName}</p>
                        <p className="text-[10px] text-neutral-500">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gold-400">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="p-3 flex justify-between items-center text-xs font-bold bg-neutral-900/40 border-t border-gold-800/15">
                    <span className="text-[#8C8C8C]">Total (Envío Inc.)</span>
                    <span className="text-white">S/ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-10 font-sans text-xs">
              <ClipboardList size={48} className="text-gold-800/20 mb-2 stroke-[1]" />
              <p>Seleccione un pedido de la lista lateral para inspeccionar sus detalles, comprobantes y actualizar su flujo logístico.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== FEEDBACK MODAL ==================== */}
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
