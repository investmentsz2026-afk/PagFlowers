'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, Printer, ShoppingBag, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

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
  paymentReceipt?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConfirmationPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch placed order details
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error('Failed to load order details in confirmation page:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  // Generate WhatsApp text details URL
  const getWhatsAppUrl = () => {
    if (!order) return '';
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
    
    // Format list of items
    const itemsText = order.items
      .map((item) => `- ${item.productName} (x${item.quantity})`)
      .join('%0A');

    let message = `*NUEVO PEDIDO ROSSYFLOWERS*%0A%0A` +
      `*Número de Pedido:* ${order.orderNumber}%0A` +
      `*Cliente:* ${order.clientName}%0A` +
      `*Teléfono:* ${order.clientPhone}%0A` +
      `*Productos:*%0A${itemsText}%0A%0A`;
    
    message += `*Total:* S/ ${order.total.toFixed(2)}%0A`;
    message += `*Método de Pago:* ${order.paymentMethod}%0A`;
    message += `*Entrega:* ${dateFormatted} (${order.deliveryTime})%0A`;
    
    if (order.cardMessage) {
      message += `%0A*Dedicatoria:* ${order.cardMessage}%0A`;
    }
    
    if (order.paymentReceipt) {
      const receiptUrl = `${window.location.origin}${order.paymentReceipt}`;
      message += `%0A*Comprobante de Pago:* ${receiptUrl}%0A`;
    }
    
    message += `%0AAdjunto comprobante de pago para validar mi pedido. ¡Muchas gracias!`;

    return `https://wa.me/${number}?text=${message}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-48 pb-32 text-center font-sans">
        <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-luxury-black/60">Cargando confirmación de pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-48 pb-32 text-center space-y-4 font-sans">
        <h1 className="font-serif text-2xl text-luxury-black">Pedido no encontrado</h1>
        <p className="text-xs text-luxury-black/50">El número de pedido que intentas consultar no existe o hubo un error.</p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-luxury-black text-white text-xs uppercase tracking-widest font-semibold rounded">
          Volver a Inicio
        </Link>
      </div>
    );
  }

  const dateFormatted = new Date(order.deliveryDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-[var(--background)] min-h-screen pt-32 pb-16 print:bg-white print:py-0 print:text-black print:min-h-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 print:px-0">
        
        {/* Print-only invoice section */}
        <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl p-6 sm:p-12 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black print:space-y-0">
          
          <div id="receipt-container" className="space-y-8 bg-[var(--background)] print:bg-white print:text-black print:p-6 print:max-w-2xl print:mx-auto print:space-y-4">
            {/* Header Card */}
            <div className="text-center space-y-4 print:text-center print:border-b print:border-black/20 print:pb-4 print:space-y-2">
              <div className="flex justify-center print:hidden">
                <CheckCircle2 size={64} className="text-gold-500 stroke-[1.5]" />
              </div>
            <span className="font-sans text-[10px] tracking-[0.35em] text-gold-600 uppercase font-bold block print:hidden">
              ¡Pedido Registrado con Éxito!
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-luxury-black tracking-wide print:text-black">
              <span className="hidden print:block text-xs font-sans tracking-[0.4em] font-bold text-black/60 mb-4">COMPROBANTE DE PEDIDO</span>
              <span className="print:hidden">Gracias por Elegir </span>RossyFlowers
            </h1>
            <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2 print:hidden" />
            <p className="font-sans text-xs text-luxury-black/60 max-w-md mx-auto print:hidden">
              Tu orden ha sido registrada en nuestro sistema y está lista para preparación. Sigue las instrucciones de pago a continuación.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-[var(--background)] border border-gold-400/10 rounded-2xl p-6 sm:p-8 space-y-6 print:bg-transparent print:border-none print:p-0 print:text-black print:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between border-b border-gold-400/10 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-sans uppercase text-luxury-black/40 print:text-black/50">Código de Pedido</span>
                <p className="font-serif text-lg font-bold text-luxury-black print:text-black">{order.orderNumber}</p>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-sans uppercase text-luxury-black/40 print:text-black/50">Estado de Pedido</span>
                <p className="font-sans text-xs font-bold text-gold-600 uppercase tracking-widest print:text-black">{order.status}</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
              <div className="space-y-3">
                <h3 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600 print:text-black">
                  Datos de Entrega
                </h3>
                <ul className="space-y-2 text-luxury-black/70 print:text-black">
                  <li className="flex gap-2">
                    <MapPin size={14} className="text-gold-400 flex-shrink-0 mt-0.5 print:hidden" />
                    <span>{order.deliveryAddress}, {order.deliveryDistrict}</span>
                  </li>
                  <li className="flex gap-2">
                    <Calendar size={14} className="text-gold-400 flex-shrink-0 mt-0.5 print:hidden" />
                    <span className="capitalize">{dateFormatted}</span>
                  </li>
                  <li className="flex gap-2">
                    <Clock size={14} className="text-gold-400 flex-shrink-0 mt-0.5 print:hidden" />
                    <span>Rango Horario: {order.deliveryTime}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600 print:text-black">
                  Cliente & Contacto
                </h3>
                <ul className="space-y-1.5 text-luxury-black/70 print:text-black">
                  <li><strong className="text-luxury-black/90 print:text-black font-bold">Nombre:</strong> {order.clientName}</li>
                  <li><strong className="text-luxury-black/90 print:text-black font-bold">Teléfono:</strong> {order.clientPhone}</li>
                  <li><strong className="text-luxury-black/90 print:text-black font-bold">Email:</strong> {order.clientEmail}</li>
                  <li><strong className="text-luxury-black/90 print:text-black font-bold">Método Pago:</strong> {order.paymentMethod}</li>
                </ul>
              </div>
            </div>

            {/* Card message preview */}
            {order.cardMessage && (
              <div className="border-t border-gold-400/10 pt-4 space-y-2">
                <h4 className="font-serif text-xs font-semibold text-luxury-black flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold-500" /> Tarjeta Dedicatoria Lacrada
                </h4>
                <p className="font-sans text-xs italic text-luxury-black/60 bg-[var(--background)] p-4 rounded-lg border border-gold-400/5 print:border-none print:bg-white print:text-black">
                  "{order.cardMessage}"
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 print:space-y-2">
            <h3 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600 print:text-black print:mt-4">
              Resumen de Productos
            </h3>
            <div className="border border-gold-400/10 print:border-black/20 rounded-2xl overflow-hidden">
              <table className="w-full text-xs font-sans text-left print:text-black">
                <thead className="bg-luxury-cream/50 print:bg-gray-100 text-[10px] uppercase tracking-widest text-luxury-black/50 print:text-black/70 border-b border-gold-400/10 print:border-black/20">
                  <tr>
                    <th className="p-4">Descripción</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4 text-right">Unitario</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/5 print:divide-black/10">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4 font-serif font-semibold text-luxury-black print:text-black">{item.productName}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">S/ {item.price.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold">S/ {(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-luxury-cream/10 print:bg-transparent font-bold border-t border-gold-400/10 print:border-black/20">
                    <td colSpan={2} className="p-4 text-luxury-black/50 print:text-black/70 text-right">Subtotal</td>
                    <td colSpan={2} className="p-4 text-right">S/ {(order.total - order.deliveryFee).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-luxury-cream/10 print:bg-transparent font-bold">
                    <td colSpan={2} className="p-4 text-luxury-black/50 print:text-black/70 text-right">Delivery</td>
                    <td colSpan={2} className="p-4 text-right">S/ {order.deliveryFee.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-luxury-cream/30 print:bg-gray-100 text-base font-bold font-serif text-luxury-black print:text-black border-t-2 border-gold-400/20 print:border-black/40">
                    <td colSpan={2} className="p-4 text-right">TOTAL PAGADO</td>
                    <td colSpan={2} className="p-4 text-right text-gold-700 print:text-black">S/ {order.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch print:hidden">
            {/* WhatsApp CTA */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs tracking-widest uppercase rounded shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
            >
              <MessageCircle size={18} className="fill-current" /> Confirmar por WhatsApp
            </a>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="py-4 px-6 border border-luxury-black text-luxury-black hover:bg-gold-50/50 font-bold text-xs tracking-widest uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={16} /> Descargar Boleta PDF
            </button>
          </div>

          {/* Helper message below button */}
          <div className="bg-[var(--background)] border border-yellow-500/50 rounded-xl p-4 flex flex-col gap-3 text-[11px] font-sans text-luxury-black/60 items-center text-center print:hidden">
            <div className="flex gap-3 items-start text-left w-full">
              <CheckCircle2 size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>IMPORTANTE:</strong> Haz clic en el botón de WhatsApp para enviar automáticamente los detalles de tu compra a un agente. Por ese medio podrás adjuntar tu comprobante de pago (Yape/Plin o transferencia) para programar el despacho de inmediato.
              </p>
            </div>
            <div className="w-full h-px bg-gold-400/10 my-2" />
            <p className="text-xs text-luxury-black/80 font-medium">
              👉 Descargue el PDF o copie su <strong className="text-gold-500">{order.orderNumber}</strong> para que pueda hacer el seguimiento de su pedido en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
