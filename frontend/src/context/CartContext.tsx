'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/services/apiClient';
import { parseNumericPrice } from '@/lib/utils';

export interface CartItem {
  id: string;
  title: string;
  price: string;
  type?: 'book' | 'course';
  itemType?: 'course' | 'book_digital' | 'book_physical' | 'book_print';
  coverImage?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const STORAGE_KEY = 'zan_cart';
const LEGACY_STORAGE_KEY = 'zan_cart_items';
const CART_SYNC_EVENT = 'zan_cart_sync';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const readCart = useCallback((): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((it: CartItem) => {
        const rawType = it.itemType || (it.type === 'book' ? 'book_print' : 'course');
        const resolvedType = rawType === 'book_physical' ? 'book_print' : rawType;
        return {
          ...it,
          itemType: resolvedType,
        };
      });
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setItems(readCart());

    const handleSync = () => {
      setItems(readCart());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener(CART_SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(CART_SYNC_EVENT, handleSync);
    };
  }, [readCart]);

  const persistLocal = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify(nextItems);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
        window.dispatchEvent(new Event(CART_SYNC_EVENT));
      } catch (err) {
        console.error('Failed to save cart to localStorage', err);
      }
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((item: CartItem) => {
    const rawType = item.itemType || (item.type === 'book' ? 'book_print' : 'course');
    const resolvedItemType = rawType === 'book_physical' ? 'book_print' : rawType;
    const normalizedItem: CartItem = {
      ...item,
      itemType: resolvedItemType,
    };

    setItems((prev) => {
      if (prev.some((existing) => existing.id === normalizedItem.id)) {
        return prev;
      }
      const updated = [normalizedItem, ...prev];
      if (typeof window !== 'undefined') {
        try {
          const serialized = JSON.stringify(updated);
          localStorage.setItem(STORAGE_KEY, serialized);
          localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
          window.dispatchEvent(new Event(CART_SYNC_EVENT));
        } catch (err) {
          console.error('Failed to update cart', err);
        }
      }
      return updated;
    });
    setIsOpen(true);

    // Non-blocking backend cart sync
    apiClient.cart
      .add({
        item_id: normalizedItem.id,
        item_type: resolvedItemType,
        title: normalizedItem.title,
        price: parseNumericPrice(normalizedItem.price),
        quantity: 1,
        cover_image: normalizedItem.coverImage,
      })
      .catch((err) => { console.warn('Failed to sync cart addition with server:', err); });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        try {
          const serialized = JSON.stringify(updated);
          localStorage.setItem(STORAGE_KEY, serialized);
          localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
          window.dispatchEvent(new Event(CART_SYNC_EVENT));
        } catch (err) {
          console.error('Failed to update cart', err);
        }
      }
      return updated;
    });

    apiClient.cart.remove(id).catch((err) => { console.warn('Failed to sync cart item removal with server:', err); });
  }, []);

  const clearCart = useCallback(() => {
    persistLocal([]);
    apiClient.cart.clear().catch((err) => { console.warn('Failed to sync cart clear with server:', err); });
  }, [persistLocal]);

  const isInCart = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      clearCart,
      isInCart,
    }),
    [items, isOpen, openCart, closeCart, toggleCart, addItem, removeItem, clearCart, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
