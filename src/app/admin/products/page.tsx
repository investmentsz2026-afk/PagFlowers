'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertCircle, UploadCloud, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';

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
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
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
    stock: '',
    category: 'Ramos',
    tagsInput: '',
    isExclusive: false,
    isFeatured: false,
    imageInput: '',
  });

  // Feedback and Confirm Modals
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; productId: number | null }>({ show: false, productId: null });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackModal({ show: true, type, message });
  };

  // Load products
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products in admin panel:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && formData.category === 'Ramos') {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

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
      category: categories.length > 0 ? categories[0].name : 'Ramos',
      tagsInput: '',
      isExclusive: false,
      isFeatured: false,
      imageInput: '/images/products/bouquet-pasteles.webp',
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
      imageInput: prod.images[0] || '/images/products/bouquet-pasteles.webp',
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
        showFeedback('success', 'Producto eliminado correctamente.');
      } else {
        showFeedback('error', 'Error al eliminar el producto.');
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
      stock: parseInt(formData.stock),
      category: formData.category,
      tags: formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      images: [formData.imageInput],
      isExclusive: formData.isExclusive,
      isFeatured: formData.isFeatured,
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
        loadProducts();
        showFeedback('success', currentProduct ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      } else {
        const err = await res.json();
        showFeedback('error', `Error al guardar: ${err.message}`);
      }
    } catch (err) {
      showFeedback('error', 'Error de conexión.');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Gestión de Productos</h1>
          <p className="text-xs text-neutral-400 mt-1">Crea, edita, desactiva o ajusta el inventario de la tienda.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-gold-400 hover:bg-gold-500 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 cursor-pointer shadow-lg hover:scale-103 transition-transform"
        >
          <Plus size={16} /> Agregar Producto
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-neutral-950 border border-gold-800/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center border border-gold-800/20 rounded-lg px-3 py-2 bg-neutral-900/60 max-w-md w-full">
          <Search size={16} className="text-neutral-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs py-1 placeholder:text-neutral-600 focus:ring-0 text-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-neutral-950 border border-gold-800/10 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500 animate-pulse">Cargando inventario...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-500">No se encontraron productos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900 text-[10px] uppercase tracking-widest text-[#8C8C8C] border-b border-gold-800/10">
                <tr>
                  <th className="p-4">Imagen</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Atributos</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-800/5 text-neutral-300">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-900/40">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded bg-neutral-900 border border-gold-800/10 overflow-hidden">
                        <img src={prod.images[0]} alt={prod.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{prod.description}</p>
                    </td>
                    <td className="p-4">{prod.category}</td>
                    <td className="p-4 font-semibold text-gold-400">
                      S/ {prod.price.toFixed(2)}
                      {prod.salePrice !== null && (
                        <span className="block text-[10px] text-red-400 line-through">S/ {prod.salePrice.toFixed(2)}</span>
                      )}
                    </td>
                    <td className={`p-4 text-center font-bold ${prod.stock <= 2 ? 'text-red-400' : 'text-neutral-300'}`}>
                      {prod.stock}
                    </td>
                    <td className="p-4 text-center space-y-1">
                      {prod.isExclusive && (
                        <span className="block mx-auto max-w-[80px] bg-gold-400/10 text-gold-400 border border-gold-400/20 text-[8px] uppercase tracking-wider py-0.5 rounded">
                          EXCLUSIVO
                        </span>
                      )}
                      {prod.isFeatured && (
                        <span className="block mx-auto max-w-[80px] bg-green-500/10 text-green-400 border border-green-500/20 text-[8px] uppercase tracking-wider py-0.5 rounded">
                          DESTACADO
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 bg-neutral-900 text-gold-400 hover:bg-gold-400 hover:text-neutral-950 border border-gold-800/15 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ show: true, productId: prod.id })}
                          className="p-2 bg-neutral-900 text-red-400 hover:bg-red-950 hover:text-red-300 border border-gold-800/15 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gold-800/10 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white font-bold uppercase tracking-wider">
                {currentProduct ? 'Editar Producto' : 'Crear Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Nombre del Arreglo *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white placeholder:text-neutral-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Descripción del Producto *</label>
                <textarea
                  required
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white placeholder:text-neutral-600 outline-none resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 py-2 border-b border-gold-800/10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSaleActive}
                      onChange={(e) => {
                        const active = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          isSaleActive: active,
                          salePrice: active ? formData.salePrice : '',
                          saleDescription: active ? formData.saleDescription : ''
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    <span className="ml-3 text-xs font-bold text-neutral-300 uppercase tracking-widest">
                      Activar Oferta Especial
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Precio Regular (S/) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none"
                    />
                  </div>
                  
                  {formData.isSaleActive && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-red-400 block font-bold">Precio de Oferta (S/) *</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        placeholder="Ej. 199.90"
                        className="w-full p-2.5 rounded border border-red-500/50 bg-red-500/10 text-white outline-none focus:border-red-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Stock Disponible *</label>
                    <input
                      required
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none"
                    />
                  </div>
                </div>

                {formData.isSaleActive && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-red-400 block font-bold">Descripción de la Oferta *</label>
                    <input
                      required
                      type="text"
                      name="saleDescription"
                      value={formData.saleDescription}
                      onChange={handleInputChange}
                      placeholder="Ej. 50% de descuento por 24 horas"
                      className="w-full p-2.5 rounded border border-red-500/50 bg-red-500/10 text-white placeholder:text-red-400/50 outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Categoría *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white outline-none"
                  >
                    {categories.length === 0 && <option value="Ramos">Ramos</option>}
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Etiquetas (coma-separadas)</label>
                  <input
                    type="text"
                    name="tagsInput"
                    value={formData.tagsInput}
                    onChange={handleInputChange}
                    placeholder="rosas, amor, romance"
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-900 text-white placeholder:text-neutral-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Imagen del Producto *</label>
                
                <div className="bg-neutral-900 border-2 border-dashed border-gold-800/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group hover:border-gold-400/50 transition-colors h-48">
                  {formData.imageInput ? (
                    <div className="absolute inset-0">
                      <img src={formData.imageInput} alt="Producto" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>
                  ) : (
                    <ImageIcon size={32} className="text-gold-800/40" />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="bg-gold-400 text-neutral-950 font-bold text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-lg cursor-pointer flex items-center gap-2 shadow-lg hover:bg-gold-500 transition-colors">
                      {uploading ? 'Subiendo...' : <><UploadCloud size={14} /> Cargar Imagen</>}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Ruta de la Imagen</label>
                  <input
                    required
                    type="text"
                    name="imageInput"
                    value={formData.imageInput}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-gold-400/70 outline-none select-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-wider text-gold-200/80 font-bold">
                  <input
                    type="checkbox"
                    name="isExclusive"
                    checked={formData.isExclusive}
                    onChange={handleInputChange}
                    className="rounded text-gold-400 focus:ring-0 focus:ring-offset-0 bg-neutral-900 border-gold-800/20"
                  />
                  Marcar como Exclusivo
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-wider text-gold-200/80 font-bold">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded text-gold-400 focus:ring-0 focus:ring-offset-0 bg-neutral-900 border-gold-800/20"
                  />
                  Destacar Producto
                </label>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gold-800/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-gold-800/10 text-neutral-400 hover:text-white rounded font-sans uppercase tracking-widest text-[9px] font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-neutral-950 rounded font-sans uppercase tracking-widest text-[9px] font-bold cursor-pointer shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRM ACTION MODAL ==================== */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-gold-800/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-950/40 border border-red-500/30">
                <Trash2 size={32} className="text-red-400" />
              </div>
            </div>
            <h3 className="text-white font-serif text-lg font-bold">¿Eliminar Producto?</h3>
            <p className="text-neutral-400 text-xs">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, productId: null })}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
