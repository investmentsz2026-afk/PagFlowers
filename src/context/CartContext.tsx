'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  quantity: number;
  cardMessage: string | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'cardMessage'>, quantity: number, cardMessage: string | null) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  deliveryDistrict: string;
  setDeliveryDistrict: (district: string) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0); // in percentage
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistrict, setDeliveryDistrict] = useState('');

  // Load cart on initial mount
  useEffect(() => {
    const storedCart = localStorage.getItem('rossyflowers_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart data from localStorage', e);
      }
    }
  }, []);

  // Save cart to local storage when it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('rossyflowers_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Omit<CartItem, 'quantity' | 'cardMessage'>, quantity: number, cardMessage: string | null) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      newCart[existingIndex].cardMessage = cardMessage; // Update card message if customized again
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity, cardMessage }]);
    }
  };

  const removeFromCart = (id: number) => {
    const newCart = cart.filter((item) => item.id !== id);
    saveCart(newCart);
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newCart = cart.map((item) => (item.id === id ? { ...item, quantity } : item));
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setDiscount(0);
    setDeliveryFee(0);
    setDeliveryDistrict('');
  };

  const applyCoupon = (code: string): boolean => {
    const cleanedCode = code.toUpperCase().trim();
    if (cleanedCode === 'PROMO10' || cleanedCode === 'LIMA10') {
      setCouponCode(cleanedCode);
      setDiscount(10); // 10% discount
      return true;
    }
    if (cleanedCode === 'LUJO20' || cleanedCode === 'GOLDEN20') {
      setCouponCode(cleanedCode);
      setDiscount(20); // 20% discount
      return true;
    }
    return false;
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    const activePrice = item.salePrice !== null ? item.salePrice : item.price;
    return total + activePrice * item.quantity;
  }, 0);

  const discountAmount = cartSubtotal * (discount / 100);
  const cartTotal = cartSubtotal - discountAmount + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        discount: discountAmount,
        couponCode,
        applyCoupon,
        deliveryFee,
        setDeliveryFee,
        deliveryDistrict,
        setDeliveryDistrict,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
