'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEditing ? generateSlug(name) : prev.slug,
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', slug: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing && currentId ? `/api/categories/${currentId}` : '/api/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error saving category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl text-white font-semibold tracking-wider">Categorías</h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
            Gestiona las colecciones de tu catálogo
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gold-500 text-luxury-black px-4 py-2 rounded font-semibold text-xs uppercase tracking-widest hover:bg-gold-400 transition-colors"
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-neutral-900 border border-gold-800/10 rounded-xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-gold-800/20 rounded pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-gold-800/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950/50 border-b border-gold-800/10 text-[10px] uppercase tracking-widest text-gold-200/50">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Slug / URL</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Cargando...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-500 text-sm">
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gold-800/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{cat.name}</div>
                      {cat.description && <div className="text-xs text-neutral-500 mt-1">{cat.description}</div>}
                    </td>
                    <td className="p-4 text-xs text-neutral-400 font-mono">
                      {cat.slug}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        cat.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {cat.isActive ? <Check size={10} /> : <X size={10} />}
                        {cat.isActive ? 'Activo' : 'Oculto'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 bg-neutral-800 text-neutral-400 hover:text-gold-400 hover:bg-gold-400/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => { setCategoryToDelete(cat.id); setDeleteModalOpen(true); }}
                          className="p-2 bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-gold-800/20 rounded-2xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-6 border-b border-gold-800/10 flex justify-between items-center">
                <h3 className="font-serif text-xl text-white">
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveCategory} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Nombre *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-500/50"
                      placeholder="Ej. Día de la Madre"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Slug (URL) *</label>
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-neutral-400 font-mono text-sm outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-200/60 block font-semibold">Descripción (Opcional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full p-2.5 rounded border border-gold-800/20 bg-neutral-950 text-white outline-none focus:border-gold-500/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                      <span className="ml-3 text-sm font-medium text-neutral-300">
                        {formData.isActive ? 'Activo y Visible' : 'Oculto en el Catálogo'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gold-800/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded bg-gold-500 text-luxury-black text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-red-500/20 rounded-2xl w-full max-w-sm overflow-hidden relative z-10 shadow-2xl p-6 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-white mb-2">¿Eliminar Categoría?</h3>
                <p className="text-sm text-neutral-400">
                  Esta acción no se puede deshacer. Los productos que pertenezcan a esta categoría podrían quedar sin clasificación.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-400 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
