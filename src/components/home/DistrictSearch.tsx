'use client';

import React, { useState } from 'react';
import { MapPin, Search, Truck } from 'lucide-react';

interface District {
  name: string;
  cost: number;
}

export default function DistrictSearch({ districts }: { districts: District[] }) {
  const [query, setQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const filtered = query
    ? districts.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (dist: District) => {
    setSelectedDistrict(dist);
    setQuery(dist.name);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedDistrict(null);
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gold-400/10 text-gold-500 dark:text-gold-300 rounded-xl">
          <Truck size={24} />
        </div>
        <div>
          <h3 className="font-serif text-lg text-luxury-black font-bold uppercase tracking-wider">Calculador de Delivery</h3>
          <p className="font-sans text-xs text-luxury-black/60">Consulta el costo de envío a tu distrito en Lima Metropolitana.</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center border border-[#2B1210]/35 rounded-xl px-3 py-2 bg-white/80 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-400/10">
          <Search className="text-[#111111]/60 mr-2 flex-shrink-0" size={18} />
          <input
            type="text"
            placeholder="Buscar distrito (ej. Miraflores, La Molina)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedDistrict(null);
            }}
            className="w-full bg-transparent border-none outline-none font-sans text-sm py-1 placeholder:text-[#2B1210]/55 text-[#111111] font-semibold"
          />
          {query && (
            <button
              onClick={handleClear}
              className="text-xs uppercase font-sans text-[#111111]/70 hover:text-gold-500 font-bold px-2 py-1 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {query && !selectedDistrict && filtered.length > 0 && (
          <ul className="absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-y-auto bg-luxury-cream dark:bg-[#1A1A1A] border border-gold-400/10 rounded-xl shadow-2xl py-1 font-sans text-sm divide-y divide-gold-400/5">
            {filtered.map((dist) => (
              <li
                key={dist.name}
                onClick={() => handleSelect(dist)}
                className="px-4 py-3 hover:bg-gold-400/10 dark:hover:bg-gold-400/20 cursor-pointer flex items-center justify-between text-luxury-black"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold-400" />
                  {dist.name}
                </span>
                <span className="font-semibold text-xs text-gold-500 dark:text-gold-300">Ver tarifa</span>
              </li>
            ))}
          </ul>
        )}

        {/* Not Found state */}
        {query && !selectedDistrict && filtered.length === 0 && (
          <div className="absolute left-0 right-0 z-10 mt-2 p-4 bg-luxury-cream dark:bg-[#1A1A1A] border border-gold-400/10 rounded-xl shadow-xl text-center font-sans text-xs text-luxury-black/60">
            Distrito fuera de cobertura o mal escrito. Escríbenos para consultar envíos especiales.
          </div>
        )}
      </div>

      {/* Result Display Box */}
      {selectedDistrict && (
        <div className="bg-gold-400/10 border border-gold-400/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between animate-fadeIn">
          <div className="space-y-1">
            <span className="font-sans text-[10px] uppercase tracking-wider text-gold-500 dark:text-gold-300 font-bold">Distrito Seleccionado</span>
            <h4 className="font-serif text-base text-luxury-black font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <MapPin size={16} className="text-gold-400" />
              {selectedDistrict.name}
            </h4>
          </div>
          <div className="text-right space-y-1">
            <span className="font-sans text-[10px] uppercase tracking-wider text-luxury-black/50">Costo de Envío</span>
            <p className="font-serif text-xl text-luxury-black font-bold">
              S/ {selectedDistrict.cost.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
