'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CalendarCheck, ChevronLeft, Check, Sparkles, Phone, ShieldCheck, 
  CreditCard, QrCode, Building, Award, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface PlanConfig {
  id: string;
  name: string;
  price: number;
  desc: string;
  features: string[];
}

interface FlowerConfig {
  id: string;
  label: string;
  desc: string;
}

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'petit',
    name: 'Petit Rossy',
    price: 75,
    desc: 'Perfecto para mesas de noche, repisas o escritorios pequeños.',
    features: [
      'Florero de vidrio de cortesía en la 1° entrega',
      'Arreglo compacto con flores frescas seleccionadas',
      'Rotación semanal de variedades y colores',
      'Envío a domicilio coordinado'
    ]
  },
  {
    id: 'classic',
    name: 'Clásico Rossy',
    price: 115,
    desc: 'El tamaño ideal para salas, comedores y centros de mesa de hogar u oficina.',
    features: [
      'Florero premium de cortesía en la 1° entrega',
      'Arreglo mediano de gran volumen y presencia',
      'Selección de flores exclusivas (rosas, minirrosas, lirios)',
      'Delivery incluido en zonas seleccionadas',
      'Nutrientes florales en cada entrega'
    ]
  },
  {
    id: 'deluxe',
    name: 'Rossy Imperial',
    price: 175,
    desc: 'Composiciones imponentes y sofisticadas de alta floreria para impactar.',
    features: [
      'Florero de lujo importado de cortesía en la 1° entrega',
      'Diseño exclusivo con flores premium exóticas y tulipanes',
      'Volumen imponente para recepciones o comedores grandes',
      'Asesoría personalizada sobre el cuidado',
      'Prioridad en el horario de reparto'
    ]
  }
];

const DEFAULT_FLOWERS: FlowerConfig[] = [
  { id: 'MIX', label: 'Mix Sorpresa de Estación', desc: 'Variedad de flores frescas rotando cada semana.' },
  { id: 'ROSAS', label: 'Ramos de Rosas Exclusivas', desc: 'Rosas rojas, rosadas o blancas de la más alta calidad.' },
  { id: 'TULIPANES', label: 'Tulipanes y Girasoles', desc: 'Una combinación alegre y moderna llena de energía.' },
  { id: 'PERSONALIZADO', label: 'Personalizado', desc: 'Elige tus flores preferidas en el recuadro de abajo.' }
];

function SuscripcionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
  const [flowerPreferences, setFlowerPreferences] = useState<FlowerConfig[]>(DEFAULT_FLOWERS);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    frequency: 'SEMANAL',
    planId: 'classic',
    flowerPreference: 'MIX',
    customDetails: '',
    paymentMethod: 'TARJETA'
  });

  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  // Fetch dynamic plans & flowers configuration from DB content keys
  useEffect(() => {
    async function fetchConfig() {
      try {
        const [resPlans, resFlowers] = await Promise.all([
          fetch('/api/content?key=subscription_plans'),
          fetch('/api/content?key=subscription_flowers')
        ]);
        
        if (resPlans.ok) {
          const data = await resPlans.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setPlans(data);
          }
        }
        
        if (resFlowers.ok) {
          const data = await resFlowers.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setFlowerPreferences(data);
          }
        }
      } catch (e) {
        console.error('Failed to load subscription configurations, using defaults.', e);
      }
    }
    fetchConfig();
  }, []);

  // Check URL params for Mercado Pago redirect returns
  useEffect(() => {
    const status = searchParams.get('status');
    const subNumber = searchParams.get('subNumber');
    
    if (status === 'confirmed' && subNumber) {
      setSuccessData({
        subNumber,
        clientName: 'Confirmado por Tarjeta',
        paymentMethod: 'TARJETA',
        planName: 'Suscripción Premium',
        frequency: 'SEMANAL',
        total: 115,
        paymentStatus: 'PAID'
      });
    }
  }, [searchParams]);

  const selectedPlanObj = plans.find(p => p.id === formData.planId) || plans[1] || DEFAULT_PLANS[1];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51914060876';

  const handleSelectPlan = (id: string) => {
    setFormData(prev => ({ ...prev, planId: id }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPaymentReceipt(file);

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.paymentMethod !== 'TARJETA' && !receiptBase64) {
      setError('Por favor, suba el comprobante de pago para validar la suscripción manual.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email,
        deliveryAddress: formData.address,
        deliveryDistrict: formData.district,
        planName: selectedPlanObj.name,
        frequency: formData.frequency,
        flowerPreference: formData.flowerPreference,
        customDetails: formData.customDetails,
        paymentMethod: formData.paymentMethod,
        paymentReceipt: receiptBase64,
        total: selectedPlanObj.price
      };

      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.paymentMethod === 'TARJETA' && data.initPoint) {
          // Redirect to Mercado Pago checkout
          window.location.href = data.initPoint;
        } else {
          // Manual payment success screen
          setSuccessData(data);
        }
      } else {
        const err = await res.json();
        setError(err.message || 'Hubo un error al procesar tu solicitud.');
      }
    } catch (e) {
      console.error(e);
      setError('Error de conexión con el servidor. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp text formatting for manual confirmation
  const getWhatsAppUrl = () => {
    if (!successData) return '';
    
    const frequencyLabel = 
      successData.frequency === 'SEMANAL' ? 'Semanal' :
      successData.frequency === 'QUINCENAL' ? 'Quincenal' :
      'Mensual';

    const prefObj = flowerPreferences.find(p => p.id === formData.flowerPreference);
    const prefLabel = prefObj ? prefObj.label : 'Mix Sorpresa';

    let text = `*SOLICITUD DE SUSCRIPCIÓN - ROSSYFLOWERS*%0A%0A` +
      `*Número de Registro:* ${successData.subNumber}%0A` +
      `*Plan:* ${successData.planName} (S/ ${successData.total.toFixed(2)} por entrega)%0A` +
      `*Frecuencia:* ${frequencyLabel}%0A` +
      `*Preferencia:* ${prefLabel}%0A%0A` +
      `*DATOS DE ENTREGA:*%0A` +
      `- *Nombre:* ${formData.name || successData.clientName}%0A` +
      `- *Dirección:* ${formData.address || successData.deliveryAddress}%0A` +
      `- *Distrito:* ${formData.district || successData.deliveryDistrict}%0A%0A` +
      `*Método de Pago:* ${successData.paymentMethod}%0A`;

    if (successData.paymentReceipt && successData.paymentReceipt.startsWith('data:')) {
      text += `*Comprobante de Pago:* (Cargado en el sistema)%0A`;
    }

    text += `%0AAdjunto los datos para validar mi suscripción de flores. ¡Gracias!`;
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  // SUCCESS SCREEN
  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
        <div className="flex justify-center">
          <CheckCircle2 size={64} className="text-gold-500 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <span className="font-sans text-[10px] tracking-[0.35em] text-gold-600 uppercase font-bold block">
            ¡Suscripción Registrada con Éxito!
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-black tracking-wide">
            ¡Gracias por suscribirte a RossyFlowers!
          </h1>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2" />
          <p className="font-sans text-xs text-luxury-black/60 max-w-md mx-auto leading-relaxed pt-2">
            Hemos registrado tu solicitud de suscripción. Tu número de registro único de seguimiento es:
          </p>
          <p className="font-mono text-xl font-bold text-luxury-black tracking-wider py-1 bg-gold-400/10 border border-gold-400/20 max-w-xs mx-auto rounded-lg mt-2">
            {successData.subNumber}
          </p>
        </div>

        <div className="bg-white border border-[#2B1210]/20 rounded-3xl p-6 sm:p-8 max-w-md mx-auto text-left space-y-4 text-xs font-sans shadow-md">
          <h3 className="font-serif font-bold text-sm text-[#2B1210]">Resumen de tu suscripción:</h3>
          <ul className="space-y-2 text-luxury-black/80">
            <li><strong>Plan:</strong> {successData.planName || selectedPlanObj.name}</li>
            <li><strong>Monto:</strong> S/ {successData.total.toFixed(2)} por entrega</li>
            <li><strong>Frecuencia:</strong> {successData.frequency === 'SEMANAL' ? 'Semanal' : successData.frequency === 'QUINCENAL' ? 'Quincenal' : 'Mensual'}</li>
            <li><strong>Pago:</strong> {successData.paymentMethod}</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {successData.paymentMethod !== 'TARJETA' && (
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Phone size={16} className="fill-white" /> Confirmar por WhatsApp
            </a>
          )}
          <Link
            href="/"
            className="px-8 py-4 bg-[#111111] hover:bg-gold-500 text-white hover:text-[#111111] font-bold text-xs tracking-widest uppercase rounded-xl transition-all w-full sm:w-auto text-center"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-fadeIn">
      
      {/* Configuration column - 8 cols */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* 1. Plans Cards Display */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-luxury-black font-semibold border-b border-gold-400/10 pb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-gold-500" /> 1. Elige tu Plan de Flores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const isSelected = formData.planId === plan.id;
              return (
                <div 
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`rounded-2xl border-2 p-6 flex flex-col justify-between relative transition-all duration-300 cursor-pointer shadow-md bg-white text-[#2B1210] ${
                    isSelected 
                      ? 'border-[#F46261] ring-4 ring-[#F46261]/25 scale-[1.02] bg-[#F46261]/5' 
                      : 'border-[#2B1210]/20 hover:border-gold-500 hover:scale-[1.01]'
                  }`}
                >
                  {plan.id === 'classic' && (
                    <span className="absolute -top-3 right-4 bg-gold-400 text-neutral-950 font-sans text-[7px] uppercase tracking-widest font-extrabold py-1 px-3 rounded-full shadow">
                      Popular
                    </span>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#2B1210]">{plan.name}</h3>
                      <p className="text-[10px] text-neutral-600 mt-1 leading-relaxed">{plan.desc}</p>
                    </div>
                    
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-sans font-bold">S/</span>
                      <span className="text-2xl font-serif font-bold text-gold-700">{plan.price}</span>
                      <span className="text-[9px] text-neutral-500 font-medium">/ entrega</span>
                    </div>

                    <hr className="border-[#2B1210]/10" />

                    <ul className="space-y-2 text-[10px] text-neutral-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex gap-1.5">
                          <Check size={12} className="text-gold-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Delivery Coordinate Info */}
        <div className="space-y-4 bg-white border border-[#2B1210]/20 rounded-3xl p-6 sm:p-8 shadow-md">
          <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2">
            2. Datos del Suscriptor y Entrega
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Tu Nombre Completo *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all font-medium"
                placeholder="Ej. Alessandra De la Fuente"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Celular / WhatsApp *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all font-medium"
                placeholder="Ej. 914060876"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Correo Electrónico *</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all font-medium"
                placeholder="Ej. alessandra@correo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Dirección Exacta de Entrega *</label>
              <input
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all font-medium"
                placeholder="Ej. Calle Monte Real 110, Dpto 302"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Distrito *</label>
              <input
                required
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all font-medium"
                placeholder="Ej. La Molina"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Frecuencia de las entregas *</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] outline-none focus:border-gold-500 transition-all cursor-pointer font-medium"
            >
              <option value="SEMANAL">Semanal (Una entrega por semana - 4 veces al mes)</option>
              <option value="QUINCENAL">Quincenal (Cada 15 días - 2 veces al mes)</option>
              <option value="MENSUAL">Mensual (Una entrega al mes)</option>
            </select>
          </div>
        </div>

        {/* 3. Flower Preferences Selector */}
        <div className="space-y-4 bg-white border border-[#2B1210]/20 rounded-3xl p-6 sm:p-8 shadow-md">
          <h2 className="font-serif text-base text-luxury-black font-semibold border-b border-gold-400/10 pb-2">
            3. Personaliza tus Flores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flowerPreferences.map((pref) => {
              const isSelected = formData.flowerPreference === pref.id;
              return (
                <div 
                  key={pref.id}
                  onClick={() => setFormData(prev => ({ ...prev, flowerPreference: pref.id }))}
                  className={`p-4 rounded-xl border-2 flex flex-col justify-center gap-1 cursor-pointer transition-all bg-white text-neutral-900 ${
                    isSelected
                      ? 'border-[#F46261] bg-[#F46261]/5 font-bold scale-[1.01] shadow-sm'
                      : 'border-[#2B1210]/15 hover:border-gold-400'
                  }`}
                >
                  <span className="font-serif text-xs uppercase tracking-wider text-gold-700">{pref.label}</span>
                  <span className="font-sans text-[10px] text-neutral-500 leading-relaxed font-light">{pref.desc}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-sans text-[9px] uppercase tracking-wider text-[#111111] font-bold">Detalles o Pedidos Especiales (Opcional)</label>
            <textarea
              rows={3}
              name="customDetails"
              value={formData.customDetails}
              onChange={handleInputChange}
              placeholder="Ej: Prefiero rosas rojas en cada entrega, sin tulipanes amarillos. Quiero florero solo de cerámica..."
              className="w-full text-xs p-3 rounded-lg border border-[#2B1210]/35 bg-white text-[#111111] placeholder:text-[#2B1210]/40 outline-none focus:border-gold-500 transition-all resize-none font-medium"
            />
          </div>
        </div>

        {/* 4. Payment Gateways Selector */}
        <div className="space-y-6 bg-white border border-[#2B1210]/20 rounded-3xl p-6 sm:p-8 shadow-md">
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
                    : 'border-gold-400/20 hover:border-gold-400/40 text-luxury-black/60 hover:text-luxury-black bg-white'
                }`}
              >
                {pay.icon}
                <span className="font-sans text-[10px] uppercase tracking-wider">{pay.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-[var(--luxury-cream)] border border-gold-400/10 rounded-xl p-6">
            {formData.paymentMethod === 'TARJETA' && (
              <div className="space-y-4 font-sans text-xs">
                <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                  Pago Seguro con Tarjeta de Crédito / Débito (VIA MERCADO PAGO)
                </h4>
                <p className="text-luxury-black/60 leading-relaxed">
                  Redireccionaremos a la pasarela segura e integrada de Mercado Pago. Podrás pagar de forma inmediata con tarjetas de débito/crédito de cualquier banco peruano.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Número de Tarjeta (Mockup)"
                    className="p-3 border border-[#2B1210]/35 bg-white text-neutral-950 placeholder:text-neutral-950 placeholder:font-bold rounded-lg text-xs outline-none focus:border-gold-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Titular de la Tarjeta"
                    className="p-3 border border-[#2B1210]/35 bg-white text-neutral-950 placeholder:text-neutral-950 placeholder:font-bold rounded-lg text-xs outline-none focus:border-gold-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="p-3 border border-[#2B1210]/35 bg-white text-neutral-950 placeholder:text-neutral-950 placeholder:font-bold rounded-lg text-xs outline-none focus:border-gold-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="p-3 border border-[#2B1210]/35 bg-white text-neutral-950 placeholder:text-neutral-950 placeholder:font-bold rounded-lg text-xs outline-none focus:border-gold-500 transition-all"
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'YAPE' && (
              <div className="space-y-4 text-center font-sans text-xs">
                <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                  Pago con Yape QR
                </h4>
                <p className="text-luxury-black/60 max-w-md mx-auto leading-relaxed">
                  Escanea el código QR de William Santana desde Yape e ingresa el monto del primer envío de <strong>S/ {selectedPlanObj.price.toFixed(2)}</strong>.
                </p>
                <div className="flex flex-col items-center justify-center p-5 bg-white border border-gold-400/10 rounded-xl w-64 mx-auto shadow-sm space-y-3">
                  <div className="w-48 h-48 bg-white flex items-center justify-center border border-dashed border-gold-400/30 rounded overflow-hidden">
                    <img src="/images/qr.jpeg" alt="Yape QR" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-luxury-black block">Titular: William Santana Torres</span>
                    <span className="text-[11px] text-luxury-black/70 block">Celular: <strong className="text-neutral-950 font-extrabold text-xs">914 060 876</strong></span>
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'PLIN' && (
              <div className="space-y-4 text-center font-sans text-xs">
                <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                  Pago con Plin
                </h4>
                <p className="text-luxury-black/60 max-w-md mx-auto leading-relaxed">
                  Realiza un Plin por <strong>S/ {selectedPlanObj.price.toFixed(2)}</strong> al número telefónico de William Santana.
                </p>
                <div className="flex flex-col items-center justify-center p-6 bg-white border border-gold-400/10 rounded-xl max-w-xs mx-auto shadow-sm space-y-2">
                  <span className="bg-emerald-500 text-white font-bold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">Plin Habilitado</span>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-luxury-black block">Titular: William Santana Torres</span>
                    <span className="text-[11px] text-luxury-black/70 block">Celular: <strong className="text-neutral-950 font-extrabold text-xs">914 060 876</strong></span>
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'TRANSFERENCIA' && (
              <div className="space-y-4 font-sans text-xs">
                <h4 className="font-bold text-luxury-black uppercase tracking-wider text-[10px] text-gold-600">
                  Cuentas de Transferencia Bancaria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white border border-gold-400/10 rounded-lg space-y-1 shadow-sm">
                    <span className="font-bold block text-gold-700">BCP Soles</span>
                    <p className="text-luxury-black/80 font-mono font-semibold">19395917712075</p>
                    <span className="text-[9px] text-luxury-black/40 font-semibold text-gold-600">CCI: 00219319591771207511</span>
                  </div>
                  <div className="p-4 bg-white border border-gold-400/10 rounded-lg space-y-1 shadow-sm">
                    <span className="font-bold block text-gold-700">Interbank Soles</span>
                    <p className="text-luxury-black/80 font-mono font-semibold">2903370348927</p>
                    <span className="text-[9px] text-luxury-black/40 font-semibold text-gold-600">CCI: 00329001337034892747</span>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt uploader field for non-card methods */}
            {formData.paymentMethod !== 'TARJETA' && (
              <div className="mt-6 p-4 border border-gold-400/20 bg-white rounded-lg shadow-sm">
                <label className="font-sans text-[10px] uppercase tracking-wider text-luxury-black/80 font-bold block mb-2">
                  Sube tu Comprobante de Pago *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-luxury-black/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-luxury-black hover:file:bg-gold-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary / Cart column - 4 cols */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-[#2B1210]/20 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-[#2B1210]">
          <h3 className="font-serif text-lg text-luxury-black tracking-widest">DETALLE PLAN</h3>
          
          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Plan Elegido</span>
              <span className="font-bold text-neutral-900">{selectedPlanObj.name}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Frecuencia</span>
              <span className="font-bold text-neutral-900 uppercase">
                {formData.frequency === 'SEMANAL' ? 'Semanal' : formData.frequency === 'QUINCENAL' ? 'Quincenal' : 'Mensual'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Preferencia Flores</span>
              <span className="font-bold text-neutral-900">
                {flowerPreferences.find(p => p.id === formData.flowerPreference)?.label || 'Mix Sorpresa'}
              </span>
            </div>
            <hr className="border-[#2B1210]/10" />
            <div className="flex justify-between items-center text-neutral-900">
              <span className="text-sm font-bold">Monto por Entrega</span>
              <span className="font-serif text-xl font-bold">S/ {selectedPlanObj.price.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-[#111111] hover:bg-gold-500 hover:text-white text-white font-bold text-xs tracking-widest uppercase rounded shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Procesando...' : 'Finalizar Suscripción'}
          </button>
        </div>

        <div className="bg-white border border-[#2B1210]/20 rounded-3xl p-6 shadow-md space-y-4 text-xs font-sans text-neutral-700">
          <div className="flex items-center gap-2 text-gold-600 font-serif text-sm">
            <Award size={18} />
            <span>Exclusividad y Garantía</span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            RossyFlowers garantiza la entrega de flores de invernadero frescas de primera calidad. Puedes pausar o cancelar en cualquier momento de forma gratuita.
          </p>
        </div>
      </div>
    </form>
  );
}

export default function SuscripcionPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-[var(--background)] font-sans text-luxury-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/enlaces" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-luxury-black/60 hover:text-[#F46261] transition-colors">
            <ChevronLeft size={16} /> Volver a Enlaces
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-gold-600 uppercase font-bold block">
            Planes de Suscripción
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-wider leading-tight max-w-2xl mx-auto">
            Flores Frescas en tu Hogar u Oficina
          </h1>
          <p className="text-sm text-luxury-black/60 max-w-lg mx-auto leading-relaxed">
            Suscríbete para recibir periódicamente composiciones de flores seleccionadas que llenarán tus espacios de fragancia, color y distinción.
          </p>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-6" />
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-neutral-800">
          <div className="p-6 bg-white border border-[#2B1210]/20 rounded-2xl space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-600">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1210]">Florero Gratis de Bienvenida</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              En tu primera entrega te obsequiamos un florero de vidrio de diseño adaptado a tu plan para que tus flores luzcan perfectas desde el inicio.
            </p>
          </div>
          <div className="p-6 bg-white border border-[#2B1210]/20 rounded-2xl space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-600">
              <CalendarCheck size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1210]">Rotación de Flores</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Cada entrega es una sorpresa. Alternamos rosas premium, tulipanes holandeses, orquídeas imperiales y follaje exótico de invernadero.
            </p>
          </div>
          <div className="p-6 bg-white border border-[#2B1210]/20 rounded-2xl space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-600">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2B1210]">Sin Contratos de Permanencia</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pausa, cambia de tamaño de plan, modifica la dirección de entrega o cancela tu suscripción cuando lo desees directamente por WhatsApp.
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando formulario de suscripción...</div>
        }>
          <SuscripcionClient />
        </Suspense>

      </div>
    </div>
  );
}
