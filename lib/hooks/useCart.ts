import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '@/lib/firebase/clientApp';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, options: Record<string, string>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setCart: (items) => set({ items }),
      addItem: (product, options) => {
        const cartItemId = `${product.id}-${Object.entries(options).sort().map(([key, value]) => `${key}:${value}`).join(',')}`;
        const existingItem = get().items.find((item) => item.cartItemId === cartItemId);

        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
            ),
          }));
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
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useCartStore };

export const useCart = () => {
  const store = useCartStore();

  const syncWithFirestore = async (userId: string) => {
    if (!userId) return;
    const cartRef = doc(db, 'carts', userId);
    const userCartSnap = await getDoc(cartRef);
    const firestoreItems: CartItem[] = userCartSnap.exists() ? userCartSnap.data().items : [];

    const localItems = useCartStore.getState().items;
    const mergedItems = [...firestoreItems];

    localItems.forEach(localItem => {
        const existingIndex = mergedItems.findIndex(item => item.cartItemId === localItem.cartItemId);
        if (existingIndex > -1) {
            mergedItems[existingIndex].quantity += localItem.quantity;
        } else {
            mergedItems.push(localItem);
        }
    });
    
    await setDoc(cartRef, { items: mergedItems });
    store.setCart(mergedItems);
  };

  const fetchFromFirestore = async (userId: string) => {
    if (!userId) return;
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
        store.setCart(cartSnap.data().items);
    }
  };

  const saveToFirestore = async (userId: string, items: CartItem[]) => {
      if (!userId) return;
      const cartRef = doc(db, 'carts', userId);
      await setDoc(cartRef, { items });
  }

  return { ...store, syncWithFirestore, fetchFromFirestore, saveToFirestore };
};