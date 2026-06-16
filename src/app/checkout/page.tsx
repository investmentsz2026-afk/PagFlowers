'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Truck, CreditCard, QrCode, Building, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface District {
  name: string;
  cost: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    discount,
    deliveryFee,
    setDeliveryFee,
    deliveryDistrict,
    setDeliveryDistrict,
    cartTotal,
    clearCart,
  } = useCart();

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);

  // Checkout Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: '', // 9am-1pm, 1pm-5pm, 5pm-8pm
    cardMessage: '',
    paymentMethod: 'TARJETA', // TARJETA, YAPE, PLIN, TRANSFERENCIA
  });

  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

  // Load districts
  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await fetch('/api/content?key=delivery_districts');
        if (res.ok) {
          const data = await res.json();
          setDistricts(data);
        }
      } catch (e) {
        console.error('Failed to load districts in checkout page:', e);
      }
    }
    loadDistricts();
  }, []);

  // Set default delivery fee if district was selected in cart page
  useEffect(() => {
    if (deliveryDistrict && districts.length > 0) {
      const match = districts.find((d) => d.name === deliveryDistrict);
      if (match) {
        setDeliveryFee(match.cost);
      }
    }
  }, [districts, deliveryDistrict, setDeliveryFee]);

  // Pre-fill card message from cart items if available
  useEffect(() => {
    if (cart.length > 0 && !formData.cardMessage) {
      const combinedMessages = cart.map(i => i.cardMessage).filter(Boolean).join('\n\n--- \n\n');
      if (combinedMessages) {
        setFormData(prev => ({ ...prev, cardMessage: combinedMessages }));
      }
    }
  }, [cart]);

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'deliveryDistrict') {
      if (!value) {
        setDeliveryDistrict('');
        setDeliveryFee(0);
        return;
      }
      const match = districts.find((d) => d.name === value);
      if (match) {
        setDeliveryDistrict(match.name);
        setDeliveryFee(match.cost);
      }
    }
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Tu carrito de compras está vacío.');
      return;
    }

    if (!formData.clientName || !formData.clientPhone || !formData.clientEmail) {
      alert('Por favor complete sus datos de contacto.');
      return;
    }

    if (!formData.deliveryAddress || !deliveryDistrict || !formData.deliveryDate || !formData.deliveryTime) {
      alert('Por favor complete los datos de entrega.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('clientName', formData.clientName);
      formPayload.append('clientPhone', formData.clientPhone);
      formPayload.append('clientEmail', formData.clientEmail);
      formPayload.append('deliveryAddress', formData.deliveryAddress);
      formPayload.append('deliveryDistrict', deliveryDistrict);
      formPayload.append('deliveryDate', formData.deliveryDate);
      formPayload.append('deliveryTime', formData.deliveryTime);
      formPayload.append('cardMessage', formData.cardMessage);
      formPayload.append('paymentMethod', formData.paymentMethod);
      formPayload.append('deliveryFee', deliveryFee.toString());
      formPayload.append('items', JSON.stringify(cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.salePrice !== null ? item.salePrice : item.price,
        quantity: item.quantity,
        cardMessage: item.cardMessage,
      }))));

      if (paymentReceipt && formData.paymentMethod !== 'TARJETA') {
        formPayload.append('paymentReceipt', paymentReceipt);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        body: formPayload,
      });

      if (res.ok) {
        const order = await res.json();
        // Clear cart context state
        clearCart();
        // Redirect to success page
        router.push(`/confirmation/${order.id}`);
      } else {
        const errorData = await res.json();
        alert(`Error al registrar el pedido: ${errorData.message}\n\nDetalle técnico: ${errorData.error}`);
      }
    } catch (e: any) {
      console.error('Checkout submit error:', e);
      alert('Error de conexión. Inténtelo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Min date for delivery is today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form inputs - 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-luxury-black font-semibold tracking-wide">
                  Proceso de Compra
                </h1>
                <p className="font-sans text-xs text-luxury-black/50 mt-1">Completa los datos para coordinar el envío exclusivo.</p>
              </div>

              {/* 1. Contact Info */}
              <div className="space-y-4">
                <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2">
                  1. Información de Contacto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Nombre Completo *</label>
                    <input
                      required
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Teléfono / WhatsApp *</label>
                    <input
                      required
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                      placeholder="Ej. 999999999"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Correo Electrónico *</label>
                  <input
                    required
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                    placeholder="Ej. juan.perez@correo.com"
                  />
                </div>
              </div>

              {/* 2. Delivery Coordinate Info */}
              <div className="space-y-4">
                <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2 flex items-center gap-1.5">
                  <Truck size={18} className="text-gold-500" /> 2. Detalles de Entrega en Lima
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Distrito de Destino *</label>
                    <select
                      required
                      name="deliveryDistrict"
                      value={deliveryDistrict}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                    >
                      <option value="">Seleccione Distrito...</option>
                      {districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} (+ S/ {d.cost.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Dirección Exacta de Entrega *</label>
                    <input
                      required
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                      placeholder="Av. Principal 123, Dpto 402"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Fecha de Entrega *</label>
                    <input
                      required
                      type="date"
                      name="deliveryDate"
                      min={todayStr}
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Horario de Entrega Rango *</label>
                    <select
                      required
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] outline-none focus:border-gold-500 focus:bg-white font-medium transition-all"
                    >
                      <option value="">Seleccione Rango Horario...</option>
                      <option value="9:00 AM - 1:00 PM">Mañana (9:00 AM - 1:00 PM)</option>
                      <option value="1:00 PM - 5:00 PM">Tarde (1:00 PM - 5:00 PM)</option>
                      <option value="5:00 PM - 8:00 PM">Noche (5:00 PM - 8:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Card message override (if any) */}
              <div className="space-y-4">
                <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-gold-500" /> 3. Dedicatoria Global
                </h2>
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase tracking-wider text-[#111111] font-bold">Mensaje para la Tarjeta de Regalo (Opcional)</label>
                  <textarea
                    rows={3}
                    name="cardMessage"
                    value={formData.cardMessage}
                    onChange={handleInputChange}
                    placeholder="Escribe el mensaje general que irá en la tarjeta de regalo lacrada (ej. ¡Feliz Aniversario, mi amor!). Si ya lo personalizaste en el producto, puedes dejar este campo vacío."
                    className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white/80 text-[#111111] placeholder:text-[#2B1210]/55 outline-none focus:border-gold-500 focus:bg-white font-medium transition-all resize-none"
                  />
                </div>
              </div>

              {/* 4. Payment Gateways selector */}
              <div className="space-y-6">
                <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2">
                  4. Método de Pago Seguro
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'TARJETA', label: 'Tarjetas', icon: <CreditCard size={18} /> },
                    { id: 'YAPE', label: 'Yape QR', icon: <QrCode size={18} /> },
                    { id: 'PLIN', label: 'Plin QR', icon: <QrCode size={18} /> },
                    { id: 'TRANSFERENCIA', label: 'Banco', icon: <Building size={18} /> },
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: pay.id }))}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        formData.paymentMethod === pay.id
                          ? 'border-gold-500 bg-gold-400 text-[#0a192f] shadow-md font-bold scale-105'
                          : 'border-gold-400/10 hover:border-gold-400/30 text-luxury-black/60 hover:text-luxury-black'
                      }`}
                    >
                      {pay.icon}
                      <span className="font-sans text-[10px] uppercase tracking-wider">{pay.label}</span>
                    </button>
                  ))}
                </div>

                {/* Dynamically Rendered instructions depending on payment method */}
                <div className="bg-[var(--luxury-cream)] border border-gold-400/10 rounded-xl p-6">
                  {formData.paymentMethod === 'TARJETA' && (
                    <div className="space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                        Pago Seguro con Tarjeta de Crédito / Débito (VISA, MC, AMEX)
                      </h4>
                      <p className="text-luxury-black/60 leading-relaxed">
                        Introduce los datos de tu tarjeta. La transacción está encriptada con encriptación de 256 bits y cumple con el estándar PCI-DSS.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <input
                          type="text"
                          placeholder="Número de Tarjeta (Mockup)"
                          className="p-3 border border-gold-400/20 bg-[var(--background)] text-luxury-black rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Titular de la Tarjeta"
                          className="p-3 border border-gold-400/20 bg-[var(--background)] text-luxury-black rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="p-3 border border-gold-400/20 bg-[var(--background)] text-luxury-black rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="p-3 border border-gold-400/20 bg-[var(--background)] text-luxury-black rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {(formData.paymentMethod === 'YAPE' || formData.paymentMethod === 'PLIN') && (
                    <div className="space-y-4 text-center font-sans text-xs">
                      <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                        Pago Instantáneo con QR {formData.paymentMethod}
                      </h4>
                      <p className="text-luxury-black/60 max-w-md mx-auto leading-relaxed">
                        Escanea el código QR de abajo desde la app de tu celular, ingresa el monto total de <strong>S/ {cartTotal.toFixed(2)}</strong>, y sube tu comprobante a nuestro WhatsApp al finalizar la compra.
                      </p>
                      
                      {/* Dynamic Mock QR Code Box */}
                      <div className="flex flex-col items-center justify-center p-4 bg-[var(--background)] border border-gold-400/10 rounded-xl w-48 mx-auto shadow-sm space-y-2">
                        <div className="w-40 h-40 bg-[var(--luxury-cream)] dark:bg-neutral-800 flex items-center justify-center relative border border-dashed border-gold-400/30 rounded">
                          {/* Inner Mock QR lines rendering */}
                          <QrCode size={96} className="text-luxury-black stroke-[1.2]" />
                          <div className="absolute bottom-2 font-bold text-[8px] tracking-widest text-gold-600 bg-[var(--background)] px-2 py-0.5 shadow-sm rounded-full">
                            {formData.paymentMethod} MOCK
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-luxury-black">Titular: RossyFlowers SAC</span>
                        <span className="text-[9px] text-gold-600 font-bold">Cel: 914 060 876</span>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'TRANSFERENCIA' && (
                    <div className="space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                        Instrucciones de Transferencia Bancaria
                      </h4>
                      <p className="text-luxury-black/60 leading-relaxed">
                        Transfiere el monto total a cualquiera de nuestras cuentas corrientes corporativas e ingresa el número de operación y comprobante en el enlace de WhatsApp final.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="p-4 bg-[var(--background)] border border-gold-400/10 rounded-lg space-y-1">
                          <span className="font-bold block text-gold-700">BCP Soles</span>
                          <p className="text-luxury-black/80 font-mono font-semibold">193-9999999-0-12</p>
                          <span className="text-[10px] text-luxury-black/40">CCI: 002-193-009999999012-14</span>
                        </div>
                        <div className="p-4 bg-[var(--background)] border border-gold-400/10 rounded-lg space-y-1">
                          <span className="font-bold block text-gold-700">Interbank Soles</span>
                          <p className="text-luxury-black/80 font-mono font-semibold">200-300123456-7</p>
                          <span className="text-[10px] text-luxury-black/40">CCI: 003-200-003001234567-20</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload Input for non-card payments */}
                  {formData.paymentMethod !== 'TARJETA' && (
                    <div className="mt-6 p-4 border border-gold-400/20 bg-[var(--background)] rounded-lg">
                      <label className="font-sans text-[10px] uppercase tracking-wider text-luxury-black/80 font-bold block mb-2">
                        Sube tu comprobante de pago *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setPaymentReceipt(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-luxury-black/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-luxury-black hover:file:bg-gold-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart preview card - 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg text-luxury-black tracking-widest">SU ORDEN</h3>

              {/* Items checklist */}
              <div className="divide-y divide-gold-400/5 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs font-sans gap-3">
                      <span className="text-luxury-black/70 flex-grow font-medium line-clamp-1">
                        {item.name} <span className="text-luxury-black/40 font-normal">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-luxury-black flex-shrink-0">
                        S/ {(activePrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gold-400/10" />

              {/* Totals box */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-luxury-black/60">
                  <span>Subtotal</span>
                  <span className="font-bold">S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Descuento aplicado</span>
                    <span>- S/ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-luxury-black/60">
                  <span>Envío {deliveryDistrict ? `(${deliveryDistrict})` : ''}</span>
                  <span className="font-bold">
                    {deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : 'S/ 0.00'}
                  </span>
                </div>
                
                <hr className="border-gold-400/10" />

                <div className="flex justify-between items-center text-luxury-black">
                  <span className="text-sm font-bold">Total a Pagar</span>
                  <span className="font-serif text-xl font-bold">S/ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                disabled={isSubmitting || cart.length === 0}
                type="submit"
                className="w-full py-4 bg-[#111111] hover:bg-gold-500 hover:text-white text-white font-bold text-xs tracking-widest uppercase rounded shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando Pedido...' : 'Finalizar Pedido'}
              </button>
            </div>

            {/* Guaranteed quality badge */}
            <div className="bg-[var(--background)] border border-gold-400/10 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gold-600 font-serif text-sm">
                <Award size={18} />
                <span>Exclusividad y Garantía</span>
              </div>
              <p className="font-sans text-[10px] text-luxury-black/50 leading-relaxed">
                Cada pedido de RossyFlowers se despacha en empaque premium sellado para garantizar la máxima frescura de los arreglos.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
