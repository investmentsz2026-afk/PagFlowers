'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-neutral-950 border border-gold-800/10 rounded-xl p-6 flex items-center justify-between shadow-md">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{title}</span>
        <p className="text-2xl font-serif font-bold text-white">{value}</p>
      </div>
      <div className={`p-4 rounded-lg ${colorClass} text-neutral-950`}>
        {icon}
      </div>
    </div>
  );
}

const COLORS = ['#C5A880', '#A3845C', '#886D4C', '#D8BF9D', '#FAF8F5', '#E7D9C7'];

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  SHIPPED: 'En Camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (e) {
        console.error('Failed to load admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 font-sans">
        {/* Shimmer layout */}
        <div className="h-10 w-48 bg-neutral-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-neutral-800 rounded-xl animate-pulse" />
          <div className="h-96 bg-neutral-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 font-sans text-neutral-400">
        <p>No se pudieron cargar las estadísticas del servidor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Dashboard</h1>
        <p className="text-xs text-neutral-400 mt-1">Resumen general de rendimiento comercial y logística.</p>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas del Día"
          value={`S/ ${data.todaySales.toFixed(2)}`}
          icon={<DollarSign size={20} />}
          colorClass="bg-gold-400"
        />
        <StatCard
          title="Ventas del Mes"
          value={`S/ ${data.monthSales.toFixed(2)}`}
          icon={<TrendingUp size={20} />}
          colorClass="bg-gold-300"
        />
        <StatCard
          title="Pedidos Pendientes"
          value={data.pendingCount.toString()}
          icon={<Clock size={20} />}
          colorClass="bg-yellow-500"
        />
        <StatCard
          title="Pedidos Entregados"
          value={data.deliveredCount.toString()}
          icon={<CheckCircle size={20} />}
          colorClass="bg-green-500"
        />
      </div>

      {/* 3. Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-neutral-950 border border-gold-800/10 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">
            Evolución de Ventas Mensuales (S/)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A880" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C5A880" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis stroke="#666" tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#C5A880', borderRadius: '8px', color: '#FFF' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#C5A880" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by District Distribution Pie */}
        <div className="bg-neutral-950 border border-gold-800/10 rounded-xl p-6 flex flex-col justify-between">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">
            Pedidos por Distrito
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {data.districtChart.length === 0 ? (
              <p className="text-xs text-neutral-500">Sin datos de envíos aún.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.districtChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.districtChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#C5A880', borderRadius: '8px', color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend display */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-neutral-400">
            {data.districtChart.slice(0, 4).map((d: any, i: number) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Top Selling Products and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders - 7/12 */}
        <div className="lg:col-span-7 bg-neutral-950 border border-gold-800/10 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">
            Últimos Pedidos Registrados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gold-800/15 text-[#8C8C8C] uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Código</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-800/5">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-neutral-500">
                      No hay pedidos registrados.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="text-neutral-300">
                      <td className="py-3 font-mono text-gold-400 font-bold">{ord.orderNumber}</td>
                      <td className="py-3">{ord.clientName}</td>
                      <td className="py-3 font-semibold">S/ {ord.total.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ord.status === 'DELIVERED'
                            ? 'bg-green-950 text-green-300 border border-green-800/30'
                            : 'bg-yellow-950 text-yellow-300 border border-yellow-800/30'
                        }`}>
                          {STATUS_MAP[ord.status] || ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products - 5/12 */}
        <div className="lg:col-span-5 bg-neutral-950 border border-gold-800/10 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-base font-semibold text-white tracking-wide">
            Productos Más Vendidos
          </h3>
          <ul className="divide-y divide-gold-800/5">
            {data.topProducts.length === 0 ? (
              <li className="py-4 text-center text-[11px] text-neutral-500">No hay ventas registradas aún.</li>
            ) : (
              data.topProducts.map((prod: any, idx: number) => (
                <li key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-serif font-bold text-neutral-200 line-clamp-1">{prod.name}</span>
                    <span className="text-[10px] text-neutral-500">{prod.sales} unidades vendidas</span>
                  </div>
                  <span className="font-semibold text-gold-400">S/ {prod.revenue.toFixed(2)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
