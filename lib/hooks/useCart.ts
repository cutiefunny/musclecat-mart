import { create } from 'zustand';
import { db } from '@/lib/firebase/clientApp';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // setDoc 제거
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (userId: string, product: Product, options: Record<string, string>) => Promise<void>;
  removeItem: (userId: string, cartItemId: string) => Promise<void>;
  updateQuantity: (userId: string, cartItemId: string, quantity: number) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  setCart: (items: CartItem[]) => void;
  fetchCart: (userId: string) => Promise<void>;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  setCart: (items) => set({ items }),
  
  fetchCart: async (userId) => {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().cart) {
      set({ items: userSnap.data().cart });
    } else {
      set({ items: [] });
    }
  },

  addItem: async (userId, product, options) => {
    const cartItemId = `${product.id}-${Object.entries(options).sort().map(([key, value]) => `${key}:${value}`).join(',')}`;
    const existingItem = get().items.find((item) => item.cartItemId === cartItemId);
    let newItems;

    if (existingItem) {
      newItems = get().items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      const newItem: CartItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: 1,
        options,
      };
      newItems = [...get().items, newItem];
    }
    
    set({ items: newItems });
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { cart: newItems });
  },

  removeItem: async (userId, cartItemId) => {
    const newItems = get().items.filter((item) => item.cartItemId !== cartItemId);
    set({ items: newItems });
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { cart: newItems });
  },

  updateQuantity: async (userId, cartItemId, quantity) => {
    if (quantity < 1) return;
    const newItems = get().items.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    );
    set({ items: newItems });
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { cart: newItems });
  },

  clearCart: async (userId: string) => {
    set({ items: [] });
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { cart: [] });
  },
}));

export { useCartStore };