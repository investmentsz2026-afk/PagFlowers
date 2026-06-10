'use client';

import React, { useEffect, useState } from 'react';
import { Search, Users, Phone, Mail, Award, History } from 'lucide-react';

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface Client {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const orders: Order[] = await res.json();
          
          // Group orders by email to derive clients list
          const clientsMap: Record<string, Client> = {};
          
          orders.forEach((ord) => {
            const email = ord.clientEmail.toLowerCase().trim();
            if (!clientsMap[email]) {
              clientsMap[email] = {
                email,
                name: ord.clientName,
                phone: ord.clientPhone,
                totalOrders: 0,
                totalSpent: 0,
                orders: [],
              };
            }
            
            clientsMap[email].totalOrders += 1;
            clientsMap[email].totalSpent += ord.total;
            clientsMap[email].orders.push(ord);
            
            // Prefer the latest name/phone
            clientsMap[email].name = ord.clientName;
            clientsMap[email].phone = ord.clientPhone;
          });

          setClients(Object.values(clientsMap));
        }
      } catch (e) {
        console.error('Failed to parse client statistics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getClientRank = (totalSpent: number, totalOrders: number) => {
    if (totalSpent >= 800 || totalOrders >= 3) {
      return { label: 'Vip Gold', classes: 'bg-yellow-500/10 text-gold-400 border border-gold-400/20' };
    }
    if (totalSpent >= 400 || totalOrders >= 2) {
      return { label: 'Frecuente', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    }
    return { label: 'Estándar', classes: 'bg-neutral-800 text-neutral-400 border border-neutral-700/20' };
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Gestión de Clientes</h1>
        <p className="text-xs text-neutral-400 mt-1">Directorio de compradores, frecuencias y valor acumulado.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-neutral-950 border border-gold-800/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center border border-gold-800/20 rounded-lg px-3 py-2 bg-neutral-900/60 max-w-md w-full">
          <Search size={16} className="text-neutral-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs py-1 placeholder:text-neutral-600 focus:ring-0 text-white"
          />
        </div>
      </div>

      {/* Grid Layout: left list, right history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Clients list - 7 cols */}
        <div className="lg:col-span-7 bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando directorio...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500">No se encontraron clientes registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900 text-[10px] uppercase tracking-widest text-[#8C8C8C] border-b border-gold-800/10">
                  <tr>
                    <th className="p-4">Cliente / Contacto</th>
                    <th className="p-4 text-center">Pedidos</th>
                    <th className="p-4 text-right">Monto Compra</th>
                    <th className="p-4 text-center">Rango</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-800/5 text-neutral-300">
                  {filtered.map((client) => {
                    const rank = getClientRank(client.totalSpent, client.totalOrders);
                    return (
                      <tr
                        key={client.email}
                        onClick={() => setSelectedClient(client)}
                        className={`hover:bg-neutral-900/40 cursor-pointer transition-colors ${
                          selectedClient?.email === client.email ? 'bg-gold-400/5 border-l-2 border-gold-400' : ''
                        }`}
                      >
                        <td className="p-4 space-y-1">
                          <p className="font-bold text-white text-sm">{client.name}</p>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Mail size={10} /> {client.email}
                          </p>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Phone size={10} /> {client.phone}
                          </p>
                        </td>
                        <td className="p-4 text-center font-bold text-neutral-300">{client.totalOrders}</td>
                        <td className="p-4 text-right font-bold text-gold-400">
                          S/ {client.totalSpent.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${rank.classes}`}>
                            {rank.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Client Purchases Panel - 5 cols */}
        <div className="lg:col-span-5 bg-neutral-950 border border-gold-800/10 rounded-xl p-6 shadow-md space-y-6 min-h-[400px]">
          {selectedClient ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Profile Card Header */}
              <div className="border-b border-gold-800/10 pb-4 space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-[#8C8C8C] font-semibold">Historial del Cliente</span>
                <h3 className="font-serif text-lg text-white font-bold">{selectedClient.name}</h3>
                <div className="flex gap-4 text-xs font-sans text-neutral-400">
                  <span>Pedidos: <strong className="text-white">{selectedClient.totalOrders}</strong></span>
                  <span>Total Acumulado: <strong className="text-gold-400">S/ {selectedClient.totalSpent.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
                  <History size={14} /> Compras Registradas
                </h4>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedClient.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 border border-gold-800/10 rounded-xl bg-neutral-900/30 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-gold-400 font-bold">{ord.orderNumber}</span>
                        <span className="text-neutral-500 font-sans text-[10px]">
                          {new Date(ord.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="border-t border-gold-800/5 pt-1.5 flex justify-between items-center">
                        <div className="space-y-0.5">
                          {ord.items.map((i) => (
                            <p key={i.id} className="text-[10px] text-neutral-300 font-serif">
                              {i.productName} (x{i.quantity})
                            </p>
                          ))}
                        </div>
                        <span className="font-bold text-white">S/ {ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 py-10 font-sans text-xs">
              <Users size={48} className="text-gold-800/20 mb-2 stroke-[1]" />
              <p>Seleccione un comprador de la lista lateral para inspeccionar sus transacciones, tickets y valor como cliente.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
