'use client';

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, Sparkles, UploadCloud, Image as ImageIcon, Trash2, Edit3, Plus, Star } from 'lucide-react';

interface TestimonialConfig {
  name: string;
  district: string;
  initials: string;
  text: string;
  stars: number;
}

const DEFAULT_TESTIMONIALS: TestimonialConfig[] = [
  {
    name: 'Alessandra De la Fuente',
    district: 'San Isidro',
    initials: 'AD',
    text: 'La delicadeza de los arreglos florales es insuperable. Compré la Caja Hexagonal Dorada y mi madre quedó completamente fascinada. El servicio fotográfico previo al envío me dio muchísima seguridad. ¡La mejor florería de Lima sin duda!',
    stars: 5,
  },
  {
    name: 'Giancarlo Barbieri',
    district: 'Miraflores',
    initials: 'GB',
    text: 'Impresionante nivel de servicio. Hice un pedido de orquídeas blancas a última hora de la mañana y lo entregaron a las 3 PM impecable, tal cual las fotos. Las dedicatorias en la tarjeta premium con sello de cera le dan un toque increíble.',
    stars: 5,
  },
  {
    name: 'Mariana Prado',
    district: 'La Molina',
    initials: 'MP',
    text: 'Los ramos de rosas en tonos pastel son una obra de arte. Se nota el cuidado y el diseño florístico detrás. El proceso de compra fue rapidísimo, y el botón directo a WhatsApp para coordinar el pago y envío por Yape funciona de maravilla.',
    stars: 5,
  },
];

interface OurStoryConfig {
  title: string;
  subtitle: string;
  text1: string;
  text2: string;
  image: string;
}

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

const DEFAULT_STORY: OurStoryConfig = {
  title: 'NUESTRO ARTE, TU HISTORIA',
  subtitle: 'RossyFlowers Art',
  text1: 'En **RossyFlowers** entendemos que las flores no son un obsequio cualquiera; son un canal directo hacia el corazón y la memoria de quien las recibe. Diseñamos bajo un concepto de alta costura floral en Lima, seleccionando cada tallo una por una para crear composiciones cargadas de emoción, elegancia y exclusividad.',
  text2: 'Evitamos los arreglos genéricos y ordinarios. Cada uno de nuestros diseños cuenta con un sello propio de lujo, desde nuestras cajas aterciopeladas hasta las dedicatorias lacradas a mano con cera real. Hacemos que cada entrega genere un verdadero impacto **WOW**, transformando un día común en una anécdota de orgullo inolvidable.',
  image: '/images/products/bouquet-pasteles.webp'
};

export default function AdminContentPage() {
  const [ourStory, setOurStory] = useState<OurStoryConfig>(DEFAULT_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [catalogPdf, setCatalogPdf] = useState('');
  const [uploadedPdfName, setUploadedPdfName] = useState('');

  const [testimonials, setTestimonials] = useState<TestimonialConfig[]>(DEFAULT_TESTIMONIALS);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialConfig>({
    name: '',
    district: '',
    initials: '',
    text: '',
    stars: 5,
  });

  // Subscription plan and flowers configuration states
  const [subPlans, setSubPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
  const [subFlowers, setSubFlowers] = useState<FlowerConfig[]>(DEFAULT_FLOWERS);
  const [newFlowerLabel, setNewFlowerLabel] = useState('');
  const [newFlowerDesc, setNewFlowerDesc] = useState('');

  // Load config
  useEffect(() => {
    async function loadContent() {
      try {
        const [resStory, resPdf, resTestimonials, resPlans, resFlowers] = await Promise.all([
          fetch('/api/content?key=our_story'),
          fetch('/api/content?key=monthly_catalog_pdf'),
          fetch('/api/content?key=testimonials'),
          fetch('/api/content?key=subscription_plans'),
          fetch('/api/content?key=subscription_flowers')
        ]);
        
        if (resStory.ok) {
          const data = await resStory.json();
          if (data && Object.keys(data).length > 0) {
            setOurStory({ ...DEFAULT_STORY, ...data });
          }
        }
        
        if (resPdf.ok) {
          const data = await resPdf.json();
          if (data && typeof data === 'string') {
            setCatalogPdf(data);
            const parts = data.split('/');
            setUploadedPdfName(parts[parts.length - 1]);
          }
        }

        if (resTestimonials.ok) {
          const data = await resTestimonials.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setTestimonials(data);
          }
        }

        if (resPlans.ok) {
          const data = await resPlans.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setSubPlans(data);
          }
        }

        if (resFlowers.ok) {
          const data = await resFlowers.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setSubFlowers(data);
          }
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleChange = (field: keyof OurStoryConfig, value: string) => {
    setOurStory((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setOurStory((prev) => ({ ...prev, image: data.url }));
      } else {
        const err = await res.json();
        setError(err.message || 'Error al subir la imagen.');
      }
    } catch (err) {
      setError('Error de conexión al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCatalogPdf(data.url);
        setUploadedPdfName(file.name);
      } else {
        const err = await res.json();
        setError(err.message || 'Error al subir el PDF.');
      }
    } catch (err) {
      setError('Error de conexión al subir el PDF.');
    } finally {
      setUploading(false);
    }
  };

  const saveTestimonialsToDb = async (updatedList: TestimonialConfig[]) => {
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'testimonials', value: updatedList }),
      });

      if (res.ok) {
        setTestimonials(updatedList);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al guardar los testimonios en el servidor.');
      }
    } catch (err) {
      setError('Error de conexión al guardar testimonios.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditTestimonial = (index: number) => {
    setEditingIndex(index);
    setTestimonialForm(testimonials[index]);
  };

  const handleCancelEditTestimonial = () => {
    setEditingIndex(null);
    setTestimonialForm({ name: '', district: '', initials: '', text: '', stars: 5 });
  };

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.district || !testimonialForm.text) {
      alert('Por favor complete el nombre, distrito y mensaje del testimonio.');
      return;
    }
    
    const updated = [...testimonials];
    if (editingIndex !== null) {
      updated[editingIndex] = testimonialForm;
    } else {
      updated.push(testimonialForm);
    }

    await saveTestimonialsToDb(updated);
    handleCancelEditTestimonial();
  };

  const handleDeleteTestimonial = async (index: number) => {
    if (confirm('¿Está seguro de eliminar este testimonio?')) {
      const updated = testimonials.filter((_, idx) => idx !== index);
      await saveTestimonialsToDb(updated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const reqs = [
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'our_story', value: ourStory }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'monthly_catalog_pdf', value: catalogPdf }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'testimonials', value: testimonials }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'subscription_plans', value: subPlans }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'subscription_flowers', value: subFlowers }),
        })
      ];

      const responses = await Promise.all(reqs);

      if (responses.every(r => r.ok)) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al guardar algunas configuraciones.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Gestión de Contenido</h1>
        <p className="text-xs text-neutral-400 mt-1">Personaliza los textos e imágenes de "Nuestra Historia" en la página principal.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando configuración...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
          
          {/* Notifications */}
          {success && (
            <div className="p-4 bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold transition-all space-y-1">
              <div>✔ ¡Sección "Nuestra Historia" actualizada con éxito!</div>
              <div>✔ ¡Catálogo PDF del mes guardado con éxito!</div>
              <div>✔ ¡Testimonios del carrusel guardados con éxito!</div>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-800/10 pb-3">
              <Sparkles size={16} className="text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Sección: Nuestra Historia
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Text Fields */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Subtítulo Pequeño (Sobretítulo)</label>
                  <input
                    required
                    type="text"
                    value={ourStory.subtitle}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Título Principal</label>
                  <input
                    required
                    type="text"
                    value={ourStory.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Párrafo 1 (Introducción)</label>
                  <textarea
                    required
                    rows={4}
                    value={ourStory.text1}
                    onChange={(e) => handleChange('text1', e.target.value)}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Párrafo 2 (Detalles)</label>
                  <textarea
                    required
                    rows={4}
                    value={ourStory.text2}
                    onChange={(e) => handleChange('text2', e.target.value)}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400 resize-none"
                  />
                </div>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Imagen Principal de la Sección</label>
                
                <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-64">
                  {ourStory.image ? (
                    <div className="absolute inset-0">
                      <img src={ourStory.image} alt="Nuestra Historia" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>
                  ) : (
                    <ImageIcon size={40} className="text-gold-800/40" />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="bg-gold-400 text-neutral-950 font-bold text-[10px] uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 shadow-lg hover:bg-gold-500 transition-colors">
                      {uploading ? 'Subiendo...' : <><UploadCloud size={14} /> Cargar Imagen</>}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <p className="text-[9px] text-white/50 mt-3 max-w-xs leading-relaxed">
                      Formatos recomendados: JPG, PNG o WEBP. Tamaño máximo: 5MB.
                      Orientación vertical u horizontal (se adaptará automáticamente).
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Ruta de la Imagen (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    value={ourStory.image}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/70 outline-none select-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PDF Section */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-800/10 pb-3">
              <Sparkles size={16} className="text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Catálogo Mensual (PDF)
              </h3>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Subir nuevo archivo PDF</label>
              
              <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group hover:border-gold-400/50 transition-colors">
                <UploadCloud size={40} className="text-gold-800/40" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <span className="bg-gold-400 text-neutral-950 font-bold text-[10px] uppercase tracking-widest py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 shadow-lg hover:bg-gold-500 transition-colors">
                    {uploading ? 'Subiendo...' : 'Cargar Archivo PDF'}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <p className="text-[9px] text-white/50 mt-3 max-w-xs leading-relaxed">
                    Asegúrate de que el archivo sea un PDF ligero (menos de 5MB) para que cargue rápido en celulares.
                  </p>
                </div>
              </div>

              {uploadedPdfName && (
                <div className="p-3 bg-green-950/20 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Archivo subido: <strong className="text-white font-sans">{uploadedPdfName}</strong></span>
                </div>
              )}

              {catalogPdf && (
                <div className="space-y-1 text-xs mt-4">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">URL del PDF Actual</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={catalogPdf}
                      className="flex-grow p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/70 outline-none select-all"
                    />
                    <a href={catalogPdf} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-900 text-white rounded border border-gold-800/20 hover:bg-neutral-800 flex items-center text-[10px] uppercase font-bold tracking-wider">
                      Ver PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-800/10 pb-3">
              <Sparkles size={16} className="text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Gestión de Testimonios (Carrusel Portada)
              </h3>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="p-4 bg-neutral-900 border border-gold-800/10 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center font-bold text-gold-400 text-xs">
                          {t.initials || t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{t.name}</h4>
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Cliente de {t.district}</span>
                        </div>
                      </div>
                      <p className="text-neutral-300 italic">"{t.text}"</p>
                      <div className="flex gap-0.5">
                        {[...Array(t.stars)].map((_, i) => (
                          <Star key={i} size={12} className="fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditTestimonial(idx)}
                        className="p-1.5 bg-neutral-800 text-gold-400 hover:text-gold-300 rounded cursor-pointer"
                        title="Editar testimonio"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(idx)}
                        className="p-1.5 bg-neutral-800 text-red-400 hover:text-red-300 rounded cursor-pointer"
                        title="Eliminar testimonio"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial Form (Add or Edit) */}
              <div className="p-4 sm:p-6 bg-neutral-900/60 border border-gold-800/20 rounded-xl space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-gold-400">
                  {editingIndex !== null ? '📝 Editar Testimonio' : '➕ Agregar Testimonio'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Nombre del Cliente *</label>
                    <input
                      type="text"
                      placeholder="Ej. Mariana Prado"
                      value={testimonialForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const initials = val.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
                        setTestimonialForm(prev => ({ ...prev, name: val, initials }));
                      }}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Distrito *</label>
                    <input
                      type="text"
                      placeholder="Ej. La Molina"
                      value={testimonialForm.district}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Estrellas *</label>
                    <select
                      value={testimonialForm.stars}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, stars: parseInt(e.target.value) }))}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                    >
                      <option value="5">5 Estrellas</option>
                      <option value="4">4 Estrellas</option>
                      <option value="3">3 Estrellas</option>
                      <option value="2">2 Estrellas</option>
                      <option value="1">1 Estrella</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Mensaje/Reseña del Cliente *</label>
                  <textarea
                    rows={3}
                    placeholder="Escribe la opinión del cliente sobre RossyFlowers..."
                    value={testimonialForm.text}
                    onChange={(e) => setTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEditTestimonial}
                      className="px-4 py-2 border border-gold-800/20 text-neutral-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveTestimonial}
                    className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1"
                  >
                    {editingIndex !== null ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-800/10 pb-3">
              <Sparkles size={16} className="text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Planes de Suscripción (CMS)
              </h3>
            </div>
            
            <div className="space-y-8 text-xs font-sans">
              {subPlans.map((plan, idx) => (
                <div key={plan.id} className="p-5 bg-neutral-900 border border-gold-800/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-gold-800/5 pb-2">
                    <span className="font-bold text-gold-400 uppercase tracking-widest text-[9px]">ID: {plan.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Nombre del Plan</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => {
                          const updated = [...subPlans];
                          updated[idx].name = e.target.value;
                          setSubPlans(updated);
                        }}
                        className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Precio por Entrega (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={plan.price}
                        onChange={(e) => {
                          const updated = [...subPlans];
                          updated[idx].price = parseFloat(e.target.value) || 0;
                          setSubPlans(updated);
                        }}
                        className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400 font-mono font-bold text-gold-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Descripción Corta</label>
                      <input
                        type="text"
                        value={plan.desc}
                        onChange={(e) => {
                          const updated = [...subPlans];
                          updated[idx].desc = e.target.value;
                          setSubPlans(updated);
                        }}
                        className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                      Características (Escribe una por línea)
                    </label>
                    <textarea
                      rows={4}
                      value={plan.features.join('\n')}
                      onChange={(e) => {
                        const updated = [...subPlans];
                        updated[idx].features = e.target.value.split('\n').filter(line => line.trim());
                        setSubPlans(updated);
                      }}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Flower Preferences Section */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-800/10 pb-3">
              <Sparkles size={16} className="text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Personalización de Flores: Tipos y Preferencias (CMS)
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subFlowers.map((flower, idx) => (
                  <div key={flower.id} className="p-4 bg-neutral-900 border border-gold-800/10 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[10px] text-gold-400 uppercase tracking-widest">ID: {flower.id}</span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={flower.label}
                          placeholder="Etiqueta / Nombre"
                          onChange={(e) => {
                            const updated = [...subFlowers];
                            updated[idx].label = e.target.value;
                            setSubFlowers(updated);
                          }}
                          className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400 font-bold"
                        />
                        <input
                          type="text"
                          value={flower.desc}
                          placeholder="Descripción breve"
                          onChange={(e) => {
                            const updated = [...subFlowers];
                            updated[idx].desc = e.target.value;
                            setSubFlowers(updated);
                          }}
                          className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-neutral-300 outline-none focus:border-gold-400 text-[11px]"
                        />
                      </div>
                    </div>
                    {flower.id !== 'MIX' && flower.id !== 'ROSAS' && flower.id !== 'PERSONALIZADO' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Desea eliminar esta preferencia floral?')) {
                            setSubFlowers(prev => prev.filter(f => f.id !== flower.id));
                          }
                        }}
                        className="p-1.5 bg-neutral-800 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                        title="Eliminar preferencia"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Preference Option Form */}
              <div className="p-5 bg-neutral-900 border border-dashed border-gold-800/25 rounded-xl space-y-4">
                <span className="font-bold text-white uppercase tracking-wider text-[10px] text-gold-400 block">
                  ➕ Agregar Nueva Opción de Flor
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Nombre / Etiqueta</label>
                    <input
                      type="text"
                      placeholder="Ej. Girasoles Radiantes"
                      value={newFlowerLabel}
                      onChange={(e) => setNewFlowerLabel(e.target.value)}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Descripción Corta</label>
                    <input
                      type="text"
                      placeholder="Ej. Envío rotativo de girasoles con follaje de temporada."
                      value={newFlowerDesc}
                      onChange={(e) => setNewFlowerDesc(e.target.value)}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newFlowerLabel || !newFlowerDesc) {
                      alert('Por favor, rellene el nombre y la descripción para agregar.');
                      return;
                    }
                    const newId = newFlowerLabel.toUpperCase().replace(/\s+/g, '_').slice(0, 15);
                    const newFlower: FlowerConfig = {
                      id: newId,
                      label: newFlowerLabel,
                      desc: newFlowerDesc
                    };
                    setSubFlowers(prev => [...prev, newFlower]);
                    setNewFlowerLabel('');
                    setNewFlowerDesc('');
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-gold-400 text-gold-400 hover:text-neutral-950 font-bold uppercase tracking-wider text-[10px] rounded transition-all cursor-pointer"
                >
                  Agregar Opción
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3.5 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded-lg font-sans uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
