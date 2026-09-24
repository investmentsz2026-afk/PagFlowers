'use client';

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, Sparkles, UploadCloud, Image as ImageIcon, Trash2, Edit3, Plus, Star, ArrowUp, ArrowDown } from 'lucide-react';

interface BannerConfig {
  id: number | string;
  tag?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;       // Foto del arreglo (cuadro destacado)
  bgImage?: string;   // Foto de fondo panorámica (1920x1080)
  link: string;
}

const DEFAULT_BANNERS: BannerConfig[] = [
  {
    id: 1,
    tag: 'RossyFlowers • Lima',
    title: 'Elegancia y Exclusividad en Cada Flor',
    subtitle: 'Diseños florales de autor inspirados en la alta costura para expresar tus sentimientos más profundos en Lima.',
    buttonText: 'Ver Colección Premium',
    image: '/images/hero/banner-1.webp',
    bgImage: '',
    link: '/catalog',
  },
  {
    id: 2,
    tag: 'RossyFlowers • Lima',
    title: 'Momentos Inolvidables',
    subtitle: 'Colecciones exclusivas en cajas aterciopeladas y orquídeas imperiales con envío express garantizado el mismo día.',
    buttonText: 'Explorar Cajas de Lujo',
    image: '/images/hero/banner-2.webp',
    bgImage: '',
    link: '/catalog?category=Cajas+de+Lujo',
  },
];

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
  secondaryImage?: string;
}

interface CatalogBannerConfig {
  tag?: string;
  subtitle: string;
  title: string;
  description: string;
  bgImage: string;
  image1: string;
  image2: string;
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
  image: '/images/products/bouquet-pasteles.webp',
  secondaryImage: '/images/products/caja-rosas.webp',
};

const DEFAULT_CATALOG_BANNER: CatalogBannerConfig = {
  tag: 'RossyFlowers • Colección Exclusiva',
  subtitle: 'BIENVENIDOS A LA',
  title: 'Alta Florería',
  description: 'Colección exclusiva de flores y regalos de autor en Lima con despacho express.',
  bgImage: '/images/hero/banner-1.webp',
  image1: '/images/products/bouquet-pasteles.webp',
  image2: '/images/products/caja-rosas.webp',
};

export default function AdminContentPage() {
  const [banners, setBanners] = useState<BannerConfig[]>(DEFAULT_BANNERS);
  const [uploadingBanner, setUploadingBanner] = useState<{ index: number; field: 'image' | 'bgImage' } | null>(null);
  const [savingBanners, setSavingBanners] = useState(false);

  const [ourStory, setOurStory] = useState<OurStoryConfig>(DEFAULT_STORY);
  const [catalogBanner, setCatalogBanner] = useState<CatalogBannerConfig>(DEFAULT_CATALOG_BANNER);
  const [uploadingCatalogField, setUploadingCatalogField] = useState<'bgImage' | 'image1' | 'image2' | null>(null);
  const [savingCatalogBanner, setSavingCatalogBanner] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingStoryField, setUploadingStoryField] = useState<'image' | 'secondaryImage' | null>(null);
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
        const [resBanners, resStory, resCatalogBanner, resPdf, resTestimonials, resPlans, resFlowers] = await Promise.all([
          fetch('/api/content?key=home_banners'),
          fetch('/api/content?key=our_story'),
          fetch('/api/content?key=catalog_banner'),
          fetch('/api/content?key=monthly_catalog_pdf'),
          fetch('/api/content?key=testimonials'),
          fetch('/api/content?key=subscription_plans'),
          fetch('/api/content?key=subscription_flowers')
        ]);
        
        if (resBanners.ok) {
          const bannerData = await resBanners.json();
          if (bannerData && Array.isArray(bannerData) && bannerData.length > 0) {
            setBanners(bannerData);
          }
        }

        if (resStory.ok) {
          const data = await resStory.json();
          if (data && Object.keys(data).length > 0) {
            setOurStory({ ...DEFAULT_STORY, ...data });
          }
        }

        if (resCatalogBanner.ok) {
          const catData = await resCatalogBanner.json();
          if (catData && Object.keys(catData).length > 0) {
            setCatalogBanner({ ...DEFAULT_CATALOG_BANNER, ...catData });
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

  const handleBannerChange = (index: number, field: keyof BannerConfig, value: string) => {
    setBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBannerImageUpload = async (
    index: number,
    field: 'image' | 'bgImage',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner({ index, field });
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
        setBanners((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: data.url };
          return updated;
        });
      } else {
        const err = await res.json();
        setError(err.message || 'Error al subir la imagen.');
      }
    } catch (err) {
      setError('Error de conexión al subir la imagen.');
    } finally {
      setUploadingBanner(null);
    }
  };

  const handleAddBanner = () => {
    const newBanner: BannerConfig = {
      id: Date.now(),
      tag: 'RossyFlowers • Lima',
      title: 'Nuevo Diseño Floral Exclusivo',
      subtitle: 'Diseños florales de autor inspirados en la alta costura para expresar tus sentimientos.',
      buttonText: 'Ver Colección Premium',
      image: '/images/hero/banner-1.webp',
      bgImage: '',
      link: '/catalog',
    };
    setBanners((prev) => [...prev, newBanner]);
  };

  const handleDeleteBanner = (index: number) => {
    if (banners.length <= 1) {
      alert('Debe haber al menos una diapositiva en el carrusel de portada.');
      return;
    }
    if (confirm(`¿Está seguro de eliminar la diapositiva #${index + 1}?`)) {
      setBanners((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    setBanners((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const saveBannersToDb = async (bannersToSave: BannerConfig[] = banners) => {
    setSavingBanners(true);
    setSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'home_banners', value: bannersToSave }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al guardar el carrusel en el servidor.');
      }
    } catch (err) {
      setError('Error de conexión al guardar el carrusel.');
    } finally {
      setSavingBanners(false);
    }
  };

  const handleChange = (field: keyof OurStoryConfig, value: string) => {
    setOurStory((prev) => ({ ...prev, [field]: value }));
  };

  const handleStoryImageUpload = async (field: 'image' | 'secondaryImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStoryField(field);
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
        setOurStory((prev) => ({ ...prev, [field]: data.url }));
      } else {
        const err = await res.json();
        setError(err.message || 'Error al subir la imagen.');
      }
    } catch (err) {
      setError('Error de conexión al subir la imagen.');
    } finally {
      setUploadingStoryField(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStoryImageUpload('image', e);
  };

  const saveOurStoryToDb = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'our_story', value: ourStory }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al guardar la sección Nuestra Historia.');
      }
    } catch (err) {
      setError('Error de conexión al guardar Nuestra Historia.');
    } finally {
      setSaving(false);
    }
  };

  const handleCatalogChange = (field: keyof CatalogBannerConfig, value: string) => {
    setCatalogBanner((prev) => ({ ...prev, [field]: value }));
  };

  const handleCatalogImageUpload = async (field: 'bgImage' | 'image1' | 'image2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCatalogField(field);
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
        setCatalogBanner((prev) => ({ ...prev, [field]: data.url }));
      } else {
        const err = await res.json();
        setError(err.message || 'Error al subir la imagen del catálogo.');
      }
    } catch (err) {
      setError('Error de conexión al subir la imagen del catálogo.');
    } finally {
      setUploadingCatalogField(null);
    }
  };

  const saveCatalogBannerToDb = async () => {
    setSavingCatalogBanner(true);
    setSuccess(false);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'catalog_banner', value: catalogBanner }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al guardar la portada de catálogo.');
      }
    } catch (err) {
      setError('Error de conexión al guardar la portada de catálogo.');
    } finally {
      setSavingCatalogBanner(false);
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
          body: JSON.stringify({ key: 'home_banners', value: banners }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'our_story', value: ourStory }),
        }),
        fetch('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'catalog_banner', value: catalogBanner }),
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
        <p className="text-xs text-neutral-400 mt-1">Personaliza el carrusel de portada, textos e imágenes de la página principal.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando configuración...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
          
          {/* Notifications */}
          {success && (
            <div className="p-4 bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold transition-all space-y-1">
              <div>✔ ¡Portada Carrusel guardada con éxito!</div>
              <div>✔ ¡Sección "Nuestra Historia" actualizada con éxito!</div>
              <div>✔ ¡Portada de Catálogo guardada con éxito!</div>
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

          {/* SECTION 1: PORTADA CARRUSEL (HERO SLIDESHOW) */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-800/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold-400" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                    Sección: Portada Carrusel (Hero Slideshow)
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Edita las imágenes, textos y enlaces de cada diapositiva en la portada principal.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBanner}
                  className="px-3.5 py-2 bg-neutral-900 border border-gold-800/30 text-gold-400 hover:bg-gold-400 hover:text-neutral-950 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={14} /> Agregar Slide
                </button>
                <button
                  type="button"
                  onClick={() => saveBannersToDb()}
                  disabled={savingBanners}
                  className="px-3.5 py-2 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save size={14} /> {savingBanners ? 'Guardando...' : 'Guardar Carrusel'}
                </button>
              </div>
            </div>

            {/* List of Carousel Slides */}
            <div className="space-y-6">
              {banners.map((banner, index) => (
                <div
                  key={banner.id ?? index}
                  className="p-5 sm:p-6 bg-neutral-900/80 border border-gold-800/20 rounded-xl space-y-5 transition-all"
                >
                  {/* Slide Card Header */}
                  <div className="flex items-center justify-between border-b border-gold-800/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 border border-gold-400/30 flex items-center justify-center text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <span className="font-serif text-xs font-bold text-white uppercase tracking-wider">
                        Diapositiva #{index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-[9px] font-sans font-bold bg-gold-400/15 text-gold-400 px-2 py-0.5 rounded border border-gold-400/20 uppercase tracking-widest">
                          Portada Inicial
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveBanner(index, 'up')}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 rounded cursor-pointer transition-colors"
                        title="Mover hacia arriba"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === banners.length - 1}
                        onClick={() => handleMoveBanner(index, 'down')}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 rounded cursor-pointer transition-colors"
                        title="Mover hacia abajo"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(index)}
                        className="p-1.5 bg-neutral-800 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded cursor-pointer transition-colors ml-1"
                        title="Eliminar esta diapositiva"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Slide Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Texts */}
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                          Sobretítulo / Etiqueta Pequeña
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. RossyFlowers • Lima"
                          value={banner.tag || ''}
                          onChange={(e) => handleBannerChange(index, 'tag', e.target.value)}
                          className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                          Título Principal *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Ej. Elegancia y Exclusividad en Cada Flor"
                          value={banner.title}
                          onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                          className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white font-semibold outline-none focus:border-gold-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                          Descripción / Subtítulo *
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Escribe la descripción que acompañará este slide..."
                          value={banner.subtitle}
                          onChange={(e) => handleBannerChange(index, 'subtitle', e.target.value)}
                          className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400 resize-none leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                            Texto del Botón
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Ver Colección Premium"
                            value={banner.buttonText}
                            onChange={(e) => handleBannerChange(index, 'buttonText', e.target.value)}
                            className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">
                            Enlace del Botón
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. /catalog o /catalog?category=Cajas+de+Lujo"
                            value={banner.link}
                            onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
                            className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Dual Image Upload & Previews */}
                    <div className="space-y-6">
                      
                      {/* Image 1: Main Flower Arrangement Photo (Card) */}
                      <div className="p-4 bg-neutral-950/70 border border-gold-800/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] uppercase tracking-wider text-gold-400 block font-bold">
                            1. Foto del Arreglo (Cuadro Destacado) *
                          </label>
                          <span className="text-[9px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded border border-gold-400/20 font-mono">
                            800x1000 px
                          </span>
                        </div>
                        
                        <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-gold-800/15 text-[10px] text-neutral-300 leading-relaxed">
                          📌 <strong>Tamaño recomendado:</strong> <span className="text-white font-semibold">800 × 1000 px</span> o <span className="text-white font-semibold">1000 × 1000 px</span> (Vertical o Cuadrado). Esta foto se mostrará completa dentro del recuadro elegante de la derecha.
                        </div>

                        <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-48">
                          {banner.image ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <img
                                src={banner.image}
                                alt={`Arreglo Slide ${index + 1}`}
                                className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-40 transition-opacity"
                              />
                            </div>
                          ) : (
                            <ImageIcon size={32} className="text-gold-800/40" />
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <span className="bg-gold-400 text-neutral-950 font-bold text-[10px] uppercase tracking-widest py-2 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                              {uploadingBanner?.index === index && uploadingBanner?.field === 'image' ? (
                                'Subiendo...'
                              ) : (
                                <>
                                  <UploadCloud size={14} /> Cargar Foto del Arreglo
                                </>
                              )}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBannerImageUpload(index, 'image', e)}
                              disabled={uploadingBanner !== null}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <p className="text-[9px] text-white/60 mt-2">
                              JPG, PNG o WEBP. Formato vertical o cuadrado.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">
                            Ruta de la Foto del Arreglo
                          </label>
                          <input
                            type="text"
                            value={banner.image}
                            onChange={(e) => handleBannerChange(index, 'image', e.target.value)}
                            placeholder="/images/hero/banner-1.webp o enlace"
                            className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none select-all text-[11px]"
                          />
                        </div>
                      </div>

                      {/* Image 2: Background Image (Full Width & Height) */}
                      <div className="p-4 bg-neutral-950/70 border border-gold-800/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] uppercase tracking-wider text-gold-400 block font-bold">
                            2. Foto de Fondo de la Portada (Fondo Panorámico)
                          </label>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">
                            1920x1080 px (16:9)
                          </span>
                        </div>

                        <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-gold-800/15 text-[10px] text-neutral-300 leading-relaxed">
                          📌 <strong>Tamaño EXACTO recomendado:</strong> <span className="text-white font-bold">1920 × 1080 px</span> (Panorámica Horizontal 16:9) o <span className="text-white font-bold">2560 × 1440 px</span>. Abarca todo el ancho y alto del fondo del carrusel sin verse recortada.
                        </div>

                        <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-48">
                          {banner.bgImage ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <img
                                src={banner.bgImage}
                                alt={`Fondo Slide ${index + 1}`}
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-1">
                              <ImageIcon size={32} className="text-gold-800/40" />
                              <span className="text-[10px] text-neutral-500">Sin foto de fondo personalizada (Usa fondo oscuro/ambiental)</span>
                            </div>
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <span className="bg-gold-400 text-neutral-950 font-bold text-[10px] uppercase tracking-widest py-2 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                              {uploadingBanner?.index === index && uploadingBanner?.field === 'bgImage' ? (
                                'Subiendo...'
                              ) : (
                                <>
                                  <UploadCloud size={14} /> {banner.bgImage ? 'Cambiar Foto de Fondo' : 'Cargar Foto de Fondo'}
                                </>
                              )}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBannerImageUpload(index, 'bgImage', e)}
                              disabled={uploadingBanner !== null}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <p className="text-[9px] text-white/60 mt-2">
                              Panorámica 1920x1080 (JPG o WEBP)
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">
                              Ruta de la Foto de Fondo
                            </label>
                            {banner.bgImage && (
                              <button
                                type="button"
                                onClick={() => handleBannerChange(index, 'bgImage', '')}
                                className="text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer"
                              >
                                Quitar fondo personalizado
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={banner.bgImage || ''}
                            onChange={(e) => handleBannerChange(index, 'bgImage', e.target.value)}
                            placeholder="Dejar vacío para fondo oscuro ambiental o sube una imagen 1920x1080"
                            className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none select-all text-[11px]"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Slide Button */}
              <button
                type="button"
                onClick={handleAddBanner}
                className="w-full py-4 bg-neutral-900/50 hover:bg-neutral-900 border border-dashed border-gold-800/30 hover:border-gold-400/50 rounded-xl text-gold-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={16} /> Agregar Nueva Diapositiva (Slide)
              </button>
            </div>
          </div>

          {/* Form Content: Nuestra Historia */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-800/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold-400" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                    Sección: Nuestra Historia
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Personaliza los títulos, párrafos y las dos imágenes superpuestas de la sección.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={saveOurStoryToDb}
                disabled={saving}
                className="px-3.5 py-2 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 self-start sm:self-auto"
              >
                <Save size={14} /> {saving ? 'Guardando...' : 'Guardar Historia'}
              </button>
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

              {/* Both Images: Main & Overlapping */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Imagen Principal (Fondo Grande) */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gold-400 block font-bold">
                        1. Imagen Principal (Fondo)
                      </label>
                      <p className="text-[9px] text-neutral-400">
                        Foto grande de fondo (800x1000 px, vertical 4:5).
                      </p>
                    </div>

                    <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-56">
                      {ourStory.image ? (
                        <div className="absolute inset-0">
                          <img src={ourStory.image} alt="Imagen Principal" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                        </div>
                      ) : (
                        <ImageIcon size={32} className="text-gold-800/40" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="bg-gold-400 text-neutral-950 font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                          {uploadingStoryField === 'image' ? 'Subiendo...' : <><UploadCloud size={13} /> Cargar Imagen</>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStoryImageUpload('image', e)}
                          disabled={uploadingStoryField !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[9px] uppercase tracking-wider text-gold-200/60 block font-semibold">Ruta / URL Imagen Principal</label>
                      <input
                        type="text"
                        value={ourStory.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* 2. Imagen Superpuesta (Flotante en Esquina) */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gold-400 block font-bold">
                        2. Imagen Superpuesta (Flotante)
                      </label>
                      <p className="text-[9px] text-neutral-400">
                        Foto encima en la esquina (600x750 px o cuadrada).
                      </p>
                    </div>

                    <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-56">
                      {(ourStory.secondaryImage || '/images/products/caja-rosas.webp') ? (
                        <div className="absolute inset-0">
                          <img src={ourStory.secondaryImage || '/images/products/caja-rosas.webp'} alt="Imagen Superpuesta" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                        </div>
                      ) : (
                        <ImageIcon size={32} className="text-gold-800/40" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="bg-gold-400 text-neutral-950 font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                          {uploadingStoryField === 'secondaryImage' ? 'Subiendo...' : <><UploadCloud size={13} /> Cargar Imagen</>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStoryImageUpload('secondaryImage', e)}
                          disabled={uploadingStoryField !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[9px] uppercase tracking-wider text-gold-200/60 block font-semibold">Ruta / URL Imagen Superpuesta</label>
                      <input
                        type="text"
                        value={ourStory.secondaryImage || ''}
                        onChange={(e) => handleChange('secondaryImage', e.target.value)}
                        placeholder="/images/products/caja-rosas.webp"
                        className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/60 border border-gold-800/20 rounded-xl text-[10px] text-neutral-300 flex items-start gap-2">
                  <Sparkles size={14} className="text-gold-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Efecto de 2 Fotos Superpuestas:</strong> La <em>Imagen Principal</em> se muestra amplia de fondo, y la <em>Imagen Superpuesta</em> aparece flotando en la esquina inferior izquierda con su marco de lujo de RossyFlowers.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: PORTADA DE CATÁLOGO (/catalog) */}
          <div className="bg-neutral-950 border border-gold-800/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-800/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold-400" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                    Sección: Portada de Catálogo (/catalog)
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Personaliza los títulos y las 3 imágenes (fondo panorámico y 2 fotos destacadas superpuestas) de la página de catálogo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={saveCatalogBannerToDb}
                disabled={savingCatalogBanner}
                className="px-3.5 py-2 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 self-start sm:self-auto"
              >
                <Save size={14} /> {savingCatalogBanner ? 'Guardando...' : 'Guardar Portada Catálogo'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Text Fields */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Insignia / Tag Superior</label>
                  <input
                    type="text"
                    value={catalogBanner.tag || ''}
                    onChange={(e) => handleCatalogChange('tag', e.target.value)}
                    placeholder="Ej. RossyFlowers • Colección Exclusiva"
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Subtítulo Pequeño</label>
                  <input
                    required
                    type="text"
                    value={catalogBanner.subtitle}
                    onChange={(e) => handleCatalogChange('subtitle', e.target.value)}
                    placeholder="Ej. BIENVENIDOS A LA"
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Título Principal</label>
                  <input
                    required
                    type="text"
                    value={catalogBanner.title}
                    onChange={(e) => handleCatalogChange('title', e.target.value)}
                    placeholder="Ej. Alta Florería"
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Descripción / Frase</label>
                  <textarea
                    required
                    rows={4}
                    value={catalogBanner.description}
                    onChange={(e) => handleCatalogChange('description', e.target.value)}
                    placeholder="Ej. Colección exclusiva de flores y regalos de autor en Lima con despacho express."
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none focus:border-gold-400 resize-none"
                  />
                </div>

                {/* Info badge */}
                <div className="p-3 bg-neutral-900/60 border border-gold-800/20 rounded-xl text-[10px] text-neutral-300 flex items-start gap-2">
                  <Sparkles size={14} className="text-gold-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Estructura Visual:</strong> Los textos se muestran al <strong>lado izquierdo</strong> y las dos fotos destacadas se exhiben con estilo moderno y superpuesto al <strong>lado derecho</strong>, todo sobre la foto de fondo panorámica.
                  </span>
                </div>
              </div>

              {/* 3 Images: Panoramic Background + 2 Overlapping Featured Photos */}
              <div className="space-y-5">
                
                {/* 1. Fondo Panorámico */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 block font-bold">
                      1. Foto de Fondo Panorámica
                    </label>
                    <p className="text-[9px] text-neutral-400">
                      Imagen que cubre el fondo de la portada (Recomendado 1920x1080 px).
                    </p>
                  </div>

                  <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-36">
                    {catalogBanner.bgImage ? (
                      <div className="absolute inset-0">
                        <img src={catalogBanner.bgImage} alt="Fondo Catálogo" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                      </div>
                    ) : (
                      <ImageIcon size={28} className="text-gold-800/40" />
                    )}
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="bg-gold-400 text-neutral-950 font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                        {uploadingCatalogField === 'bgImage' ? 'Subiendo...' : <><UploadCloud size={13} /> Cargar Fondo</>}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCatalogImageUpload('bgImage', e)}
                        disabled={uploadingCatalogField !== null}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <input
                      type="text"
                      value={catalogBanner.bgImage}
                      onChange={(e) => handleCatalogChange('bgImage', e.target.value)}
                      placeholder="/images/hero/banner-1.webp"
                      className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none text-[11px]"
                    />
                  </div>
                </div>

                {/* 2 & 3. Dos Fotos Destacadas (Lado Derecho) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Foto Destacada 1 */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gold-400 block font-bold">
                        2. Foto Destacada 1 (Principal)
                      </label>
                      <p className="text-[9px] text-neutral-400">
                        Foto frontal derecha (800x1000 px, vertical 4:5).
                      </p>
                    </div>

                    <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-44">
                      {catalogBanner.image1 ? (
                        <div className="absolute inset-0">
                          <img src={catalogBanner.image1} alt="Foto 1" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                        </div>
                      ) : (
                        <ImageIcon size={28} className="text-gold-800/40" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="bg-gold-400 text-neutral-950 font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                          {uploadingCatalogField === 'image1' ? 'Subiendo...' : <><UploadCloud size={13} /> Cargar Foto 1</>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCatalogImageUpload('image1', e)}
                          disabled={uploadingCatalogField !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <input
                        type="text"
                        value={catalogBanner.image1}
                        onChange={(e) => handleCatalogChange('image1', e.target.value)}
                        placeholder="/images/products/bouquet-pasteles.webp"
                        className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Foto Destacada 2 */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gold-400 block font-bold">
                        3. Foto Destacada 2 (Superpuesta)
                      </label>
                      <p className="text-[9px] text-neutral-400">
                        Foto flotando encima (600x600 px o cuadrada).
                      </p>
                    </div>

                    <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-44">
                      {catalogBanner.image2 ? (
                        <div className="absolute inset-0">
                          <img src={catalogBanner.image2} alt="Foto 2" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                        </div>
                      ) : (
                        <ImageIcon size={28} className="text-gold-800/40" />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="bg-gold-400 text-neutral-950 font-bold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-gold-500 transition-colors">
                          {uploadingCatalogField === 'image2' ? 'Subiendo...' : <><UploadCloud size={13} /> Cargar Foto 2</>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCatalogImageUpload('image2', e)}
                          disabled={uploadingCatalogField !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <input
                        type="text"
                        value={catalogBanner.image2}
                        onChange={(e) => handleCatalogChange('image2', e.target.value)}
                        placeholder="/images/products/caja-rosas.webp"
                        className="w-full p-2 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/80 outline-none text-[11px]"
                      />
                    </div>
                  </div>

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
