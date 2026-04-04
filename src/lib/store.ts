import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  categoryType: 'men' | 'women';
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

interface WishlistStore {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    });
  },
  removeFromCart: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }));
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  toggleWishlist: (product) => {
    set((state) => {
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        return { items: state.items.filter((i) => i.id !== product.id) };
      }
      return { items: [...state.items, product] };
    });
  },
  isInWishlist: (productId) => get().items.some((i) => i.id === productId),
}));
