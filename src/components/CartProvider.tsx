'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';

export default function ClientCartProvider({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
