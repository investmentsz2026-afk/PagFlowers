'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Plus, Trash2, Save, Edit2, Check, X, MapPin } from 'lucide-react';

interface District {
  name: string;
  cost: number;
}

export default function DeliveryClient() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCost, setEditCost] = useState<string>('');

  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState<string>('');

  const fetchDistricts = async () => {
    try {
      const res = await fetch('/api/content/delivery');
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveAll = async (updatedDistricts: District[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/content/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDistricts),
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      setDistricts(updatedDistricts);
      showMessage('Zonas de envío actualizadas correctamente.', 'success');
    } catch (error) {
      showMessage('Hubo un problema al guardar los cambios.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || !newCost || isNaN(Number(newCost))) {
      showMessage('Por favor ingresa un nombre válido y un costo numérico.', 'error');
      return;
    }

    const updated = [...districts, { name: newName.trim(), cost: Number(newCost) }];
    
    // Sort alphabetically
    updated.sort((a, b) => a.name.localeCompare(b.name));
    
    handleSaveAll(updated);
    setIsAdding(false);
    setNewName('');
    setNewCost('');
  };

  const handleEditSave = (index: number) => {
    if (!editName.trim() || !editCost || isNaN(Number(editCost))) {
      showMessage('Por favor ingresa un nombre válido y un costo numérico.', 'error');
      return;
    }

    const updated = [...districts];
    updated[index] = { name: editName.trim(), cost: Number(editCost) };
    
    // Sort alphabetically
    updated.sort((a, b) => a.name.localeCompare(b.name));

    handleSaveAll(updated);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Estás seguro de eliminar este distrito?')) {
      const updated = districts.filter((_, i) => i !== index);
      handleSaveAll(updated);
    }
  };

  const startEdit = (index: number, district: District) => {
    setEditingIndex(index);
    setEditName(district.name);
    setEditCost(district.cost.toString());
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando zonas de envío...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold flex items-center gap-3">
            <Truck className="text-gold-500" /> Zonas de Envío
          </h1>
          <p className="text-white/50 font-sans text-sm mt-1">
            Gestiona los distritos de cobertura y sus costos de delivery. Estos precios se verán en toda la web.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="bg-gold-500 hover:bg-gold-400 text-luxury-black px-6 py-2.5 rounded-lg font-sans text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} /> Añadir Distrito
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg font-sans text-sm font-medium ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#1A1A1A] text-white/50 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4 font-semibold">Distrito</th>
                <th className="px-6 py-4 font-semibold">Costo (S/)</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {/* Add New Row */}
              <AnimatePresence>
                {isAdding && (
                  <motion.tr 
                    initial={{ opacity: 0, backgroundColor: 'rgba(212,175,55,0.1)' }}
                    animate={{ opacity: 1, backgroundColor: 'transparent' }}
                    exit={{ opacity: 0 }}
                    className="bg-[#1A1A1A]/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-gold-500" />
                        <input 
                          type="text" 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Ej. San Borja"
                          className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-white w-full focus:outline-none focus:border-gold-500"
                          autoFocus
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-white/50">S/</span>
                        <input 
                          type="number" 
                          value={newCost}
                          onChange={(e) => setNewCost(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.5"
                          className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-white w-24 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleAdd} disabled={saving} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setIsAdding(false)} className="p-1.5 bg-white/5 text-white/50 rounded hover:bg-white/10 hover:text-white transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>

              {/* District List */}
              {districts.map((district, index) => (
                <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-gold-500" />
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-white w-full focus:outline-none focus:border-gold-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-white font-medium">
                        <MapPin size={16} className="text-white/20 group-hover:text-gold-500 transition-colors" />
                        {district.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-1">
                        <span className="text-white/50">S/</span>
                        <input 
                          type="number" 
                          value={editCost}
                          onChange={(e) => setEditCost(e.target.value)}
                          min="0"
                          step="0.5"
                          className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-white w-24 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    ) : (
                      <div className="text-white/80">
                        S/ {district.cost.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingIndex === index ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditSave(index)} disabled={saving} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingIndex(null)} className="p-1.5 bg-white/5 text-white/50 rounded hover:bg-white/10 hover:text-white transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(index, district)} 
                          className="p-1.5 bg-white/5 text-white/70 rounded hover:bg-white/10 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(index)} 
                          className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {districts.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-white/40">
                    No hay zonas de envío configuradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
