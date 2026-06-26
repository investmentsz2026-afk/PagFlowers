'use client';

import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, Sparkles, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface OurStoryConfig {
  title: string;
  subtitle: string;
  text1: string;
  text2: string;
  image: string;
}

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

  // Load config
  useEffect(() => {
    async function loadContent() {
      try {
        const [resStory, resPdf] = await Promise.all([
          fetch('/api/content?key=our_story'),
          fetch('/api/content?key=monthly_catalog_pdf')
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
