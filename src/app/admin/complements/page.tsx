'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertCircle, UploadCloud, Image as ImageIcon, CheckCircle, AlertTriangle, FolderOpen } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  saleDescription: string | null;
  images: string[];
  stock: number;
  category: string;
  tags: string[];
  isExclusive: boolean;
  isFeatured: boolean;
  isComplement: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function AdminComplementsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isSaleActive: false,
    salePrice: '',
    saleDescription: '',
    stock: '10',
    category: '',
    tagsInput: '',
    isExclusive: false,
    isFeatured: false,
    imageInput: '',
  });

  // Category management modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '', description: '' });

  // Feedback and Confirm Modals
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; productId: number | null }>({ show: false, productId: null });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackModal({ show: true, type, message });
  };

  // Load complement products
  const loadComplements = async () => {
    try {
      const res = await fetch('/api/products?complement=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load complements in admin panel:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load complement categories
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?complement=true');
      if (res.ok) {
        let data = await res.json();
        
        // Seed default categories if DB is empty for complements
        if (data.length === 0) {
          const defaults = [
            { name: 'Chocolates', slug: 'chocolate', description: 'Chocolates premium de regalo' },
            { name: 'Vinos', slug: 'vinos', description: 'Vinos tintos, blancos y espumantes' },
            { name: 'Cervezas', slug: 'cervezas', description: 'Cervezas artesanales e importadas' },
            { name: 'Orquídeas', slug: 'orchids', description: 'Orquídeas imperiales de colección' },
            { name: 'Globos', slug: 'globos', description: 'Globos metálicos de helio para toda ocasión' }
          ];
          
          for (const item of defaults) {
            await fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...item, isComplement: true })
            });
          }
          
          const reRes = await fetch('/api/categories?complement=true');
          if (reRes.ok) {
            data = await reRes.json();
          }
        }
        
        setCategories(data);
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].slug }));
        }
      }
    } catch (e) {
      console.error('Failed to load complement categories:', e);
    }
  };

  useEffect(() => {
    loadComplements();
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      isSaleActive: false,
      salePrice: '',
      saleDescription: '',
      stock: '10',
      category: categories.length > 0 ? categories[0].slug : '',
      tagsInput: '',
      isExclusive: false,
      isFeatured: false,
      imageInput: '/images/products/combo-especial.webp',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setCurrentProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      isSaleActive: prod.salePrice !== null,
      salePrice: prod.salePrice ? prod.salePrice.toString() : '',
      saleDescription: prod.saleDescription || '',
      stock: prod.stock.toString(),
      category: prod.category,
      tagsInput: prod.tags.join(', '),
      isExclusive: prod.isExclusive,
      isFeatured: prod.isFeatured,
      imageInput: prod.images[0] || '/images/products/combo-especial.webp',
    });
    setIsModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    const id = confirmModal.productId;
    if (!id) return;
    setConfirmModal({ show: false, productId: null });

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showFeedback('success', 'Complemento eliminado correctamente.');
      } else {
        showFeedback('error', 'Error al eliminar el complemento.');
      }
    } catch (e) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, imageInput: data.url }));
        showFeedback('success', 'Imagen subida correctamente.');
      } else {
        showFeedback('error', 'Error al subir la imagen.');
      }
    } catch (err) {
      showFeedback('error', 'Error de conexión al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    const body = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      saleDescription: formData.saleDescription || null,
      stock: parseInt(formData.stock),
      category: formData.category,
      tags: formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      images: [formData.imageInput],
      isExclusive: formData.isExclusive,
      isFeatured: formData.isFeatured,
      isComplement: true,
    };

    try {
      let res;
      if (currentProduct) {
        // Edit mode
        res = await fetch(`/api/products/${currentProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        // Create mode
        res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        loadComplements();
        showFeedback('success', currentProduct ? 'Complemento actualizado correctamente.' : 'Complemento creado correctamente.');
      } else {
        const err = await res.json();
        showFeedback('error', `Error al guardar: ${err.message}`);
      }
    } catch (err) {
      showFeedback('error', 'Error de conexión con el servidor.');
    }
  };

  // Category management logic
  const generateCategorySlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCategoryFormData(prev => ({
      ...prev,
      name,
      slug: !editingCategory?.id ? generateCategorySlug(name) : prev.slug
    }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory?.id ? 'PUT' : 'POST';
    const url = editingCategory?.id ? `/api/categories/${editingCategory.id}` : '/api/categories';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryFormData.name,
          slug: categoryFormData.slug,
          description: categoryFormData.description,
          isComplement: true
        })
      });
      
      if (res.ok) {
        setCategoryFormData({ name: '', slug: '', description: '' });
        setEditingCategory(null);
        showFeedback('success', editingCategory?.id ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
        loadCategories();
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Error al guardar la categoría.');
      }
    } catch (err) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Esto podría afectar a los productos vinculados.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Categoría eliminada.');
        loadCategories();
      } else {
        showFeedback('error', 'Error al eliminar la categoría.');
      }
    } catch (err) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Catálogo de Complementos</h1>
          <p className="text-[10px] text-neutral-400 mt-1">Gestiona chocolates, vinos, cervezas, orquídeas y globos adicionales.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="border border-gold-800/35 hover:border-gold-400 text-gold-400 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
          >
            <FolderOpen size={16} /> Categorías
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-gold-400 hover:bg-gold-500 text-neutral-950 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
          >
            <Plus size={16} /> Agregar Complemento
          </button>
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-950 border border-gold-800/10 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar complementos por nombre, descripción o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2.5 pl-10 pr-4 rounded bg-neutral-900 border border-gold-800/15 text-white outline-none focus:border-gold-400 placeholder:text-neutral-500 font-sans"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-neutral-500" />
        </div>
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
          Total: {filteredProducts.length} complementos
        </span>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando catálogo...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-neutral-950 border border-gold-800/10 rounded-xl space-y-3">
          <ImageIcon size={48} className="text-neutral-700 mx-auto" />
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">No se encontraron complementos</p>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-gold-800/10 text-[9px] uppercase tracking-widest text-gold-400 font-bold">
                  <th className="py-4 px-6 w-20">Imagen</th>
                  <th className="py-4 px-4">Nombre</th>
                  <th className="py-4 px-4">Categoría</th>
                  <th className="py-4 px-4 text-right">Precio</th>
                  <th className="py-4 px-4 text-center">Stock</th>
                  <th className="py-4 px-4 text-center">Etiquetas</th>
                  <th className="py-4 px-6 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-800/5 text-neutral-300">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded bg-neutral-900 border border-gold-800/15 overflow-hidden flex items-center justify-center relative">
                        <img
                          src={prod.images[0] || '/images/products/combo-especial.webp'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white max-w-xs truncate">
                      <div>
                        <span className="block">{prod.name}</span>
                        <span className="block text-[10px] text-neutral-500 font-normal truncate mt-0.5">{prod.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-neutral-900 border border-gold-800/20 text-gold-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                        {categories.find(c => c.slug === prod.category)?.name || prod.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      {prod.salePrice !== null ? (
                        <div className="flex flex-col items-end">
                          <span className="line-through text-neutral-500 text-[10px]">S/ {prod.price.toFixed(2)}</span>
                          <span className="text-gold-400 text-xs">S/ {prod.salePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>S/ {prod.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold">
                      <span className={prod.stock <= 2 ? 'text-red-400' : 'text-emerald-400'}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {prod.tags.map((t, idx) => (
                          <span key={idx} className="bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 bg-neutral-900 hover:bg-gold-900/20 border border-gold-800/15 text-gold-400 hover:text-gold-300 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ show: true, productId: prod.id })}
                          className="p-2 bg-neutral-900 hover:bg-red-950/20 border border-gold-800/15 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/25 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gold-800/10 flex justify-between items-center">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
                {currentProduct ? '📝 Editar Complemento' : '➕ Agregar Complemento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans flex-grow">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Nombre del Complemento *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none focus:border-gold-400"
                  placeholder="Ej. Caja de Chocolates Ferrero Rocher x16"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none focus:border-gold-400 resize-none leading-relaxed"
                  placeholder="Detalles sobre el producto, peso, marca, presentación..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Precio Estándar (S/) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none focus:border-gold-400 font-mono font-bold"
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Categoría de Complemento *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none focus:border-gold-400 cursor-pointer uppercase font-bold text-[10px] tracking-wider text-gold-400"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Offer Pricing Toggle & Inputs */}
              <div className="p-4 bg-neutral-900/60 border border-gold-800/10 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSaleActive"
                    name="isSaleActive"
                    checked={formData.isSaleActive}
                    onChange={handleInputChange}
                    className="accent-gold-400 cursor-pointer"
                  />
                  <label htmlFor="isSaleActive" className="text-[10px] uppercase tracking-wider text-white font-bold cursor-pointer">
                    Habilitar Precio de Oferta
                  </label>
                </div>

                {formData.isSaleActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">Precio de Oferta (S/)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded bg-neutral-950 border border-gold-800/20 text-gold-400 font-mono font-bold"
                        placeholder="20.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">Etiqueta de Oferta (Ej. -20%)</label>
                      <input
                        type="text"
                        name="saleDescription"
                        value={formData.saleDescription}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded bg-neutral-950 border border-gold-800/20 text-white"
                        placeholder="Ej. Oferta Especial"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Stock Físico *</label>
                  <input
                    required
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none focus:border-gold-400 font-mono"
                    placeholder="10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Etiquetas (Separadas por comas)</label>
                  <input
                    type="text"
                    name="tagsInput"
                    value={formData.tagsInput}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-white outline-none"
                    placeholder="Ej. chocolate, ferrero, premium"
                  />
                </div>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 font-semibold block">Imagen del Complemento *</label>
                <div className="flex gap-3">
                  <div className="flex-grow space-y-2">
                    <input
                      required
                      type="text"
                      name="imageInput"
                      value={formData.imageInput}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded bg-neutral-900 border border-gold-800/20 text-neutral-400 outline-none"
                      placeholder="/images/products/..."
                    />
                    <div className="relative bg-neutral-900 border border-dashed border-gold-800/20 rounded p-4 flex flex-col items-center justify-center text-center hover:border-gold-400 transition-colors">
                      <UploadCloud size={24} className="text-neutral-500" />
                      <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider mt-1.5 cursor-pointer">
                        {uploading ? 'Subiendo...' : 'Subir Archivo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-neutral-900 border border-gold-800/15 rounded overflow-hidden flex items-center justify-center relative flex-shrink-0">
                    {formData.imageInput ? (
                      <img src={formData.imageInput} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-neutral-700" />
                    )}
                  </div>
                </div>
              </div>

              {/* Exclusive / Featured Flags */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-900/40 border border-gold-800/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isExclusive"
                    name="isExclusive"
                    checked={formData.isExclusive}
                    onChange={handleInputChange}
                    className="accent-gold-400 cursor-pointer"
                  />
                  <label htmlFor="isExclusive" className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold cursor-pointer">
                    Exclusivo
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="accent-gold-400 cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold cursor-pointer">
                    Destacado (Home)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gold-800/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gold-800/20 text-neutral-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/25 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gold-800/10 flex justify-between items-center">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
                📁 Categorías de Complementos
              </h3>
              <button 
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setCategoryFormData({ name: '', slug: '', description: '' });
                }} 
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans flex-grow">
              {/* Add/Edit Form */}
              <form onSubmit={handleSaveCategory} className="bg-neutral-900/60 p-4 border border-gold-800/10 rounded-xl space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider text-gold-400 font-bold">
                  {editingCategory?.id ? '✏️ Editar Categoría' : '➕ Crear Nueva Categoría'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block">Nombre *</label>
                    <input
                      required
                      type="text"
                      value={categoryFormData.name}
                      onChange={handleCategoryNameChange}
                      className="w-full p-2 rounded bg-neutral-950 border border-gold-800/20 text-white outline-none focus:border-gold-400"
                      placeholder="Ej. Licores"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block">Slug (URL) *</label>
                    <input
                      required
                      type="text"
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full p-2 rounded bg-neutral-950 border border-gold-800/20 text-white outline-none focus:border-gold-400 font-mono"
                      placeholder="ej-licores"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block">Descripción</label>
                  <textarea
                    rows={2}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 rounded bg-neutral-950 border border-gold-800/20 text-white outline-none focus:border-gold-400 resize-none"
                    placeholder="Descripción breve de la categoría..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingCategory?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormData({ name: '', slug: '', description: '' });
                      }}
                      className="px-3 py-1.5 border border-neutral-700 text-neutral-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer font-sans"
                  >
                    {editingCategory?.id ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>

              {/* Categories list */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider text-gold-200/60 font-bold">
                  Categorías Existentes ({categories.length})
                </h4>

                <div className="divide-y divide-gold-800/10 border border-gold-800/10 rounded-xl overflow-hidden bg-neutral-950">
                  {categories.map((c) => (
                    <div key={c.id} className="p-3 flex justify-between items-center hover:bg-neutral-900/40 transition-colors">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          {c.name}
                          <span className="text-[9px] font-mono text-neutral-500 font-normal">({c.slug})</span>
                        </div>
                        {c.description && (
                          <div className="text-[10px] text-neutral-400 font-normal mt-0.5">{c.description}</div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(c);
                            setCategoryFormData({
                              name: c.name,
                              slug: c.slug,
                              description: c.description || ''
                            });
                          }}
                          className="p-1.5 bg-neutral-900 hover:bg-gold-900/20 border border-gold-800/15 text-gold-400 rounded transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1.5 bg-neutral-900 hover:bg-red-950/20 border border-gold-800/15 text-red-400 rounded transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-xl p-6 max-w-sm w-full mx-4 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
            </div>
            <h3 className="text-white font-serif text-base font-bold">¿Eliminar Complemento?</h3>
            <p className="text-neutral-400 text-xs">Esta acción es permanente y no se podrá deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal({ show: false, productId: null })}
                className="flex-grow py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-grow py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-xl p-5 max-w-xs w-full mx-4 text-center space-y-3 shadow-xl">
            <div className="flex justify-center">
              {feedbackModal.type === 'success' ? (
                <CheckCircle size={28} className="text-emerald-400" />
              ) : (
                <AlertCircle size={28} className="text-red-400" />
              )}
            </div>
            <p className="text-neutral-300 text-xs font-semibold">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ show: false, type: 'success', message: '' })}
              className="py-1.5 px-4 bg-gold-400 hover:bg-gold-500 text-neutral-950 text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
