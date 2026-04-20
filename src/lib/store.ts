import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  rating: number | null;
  reviews: number | null;
  is_featured: boolean | null;
  size_type: string | null;
  categories?: { name: string; type: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  buyNow: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  total: () => number;
  itemCount: () => number;
}

interface WishlistStore {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const cartItemKey = (id: string, size?: string) => `${id}_${size || ''}`;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1, selectedSize) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id && i.selectedSize === selectedSize
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity, selectedSize }] };
    });
  },
  buyNow: (product, quantity = 1, selectedSize) => {
    set({ items: [{ product, quantity, selectedSize }] });
  },
  removeFromCart: (productId, selectedSize) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.product.id === productId && i.selectedSize === selectedSize)
      ),
    }));
  },
  updateQuantity: (productId, quantity, selectedSize) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, selectedSize);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId && i.selectedSize === selectedSize
          ? { ...i, quantity }
          : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  setItems: (items) => set({ items }),
  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'posh-closet-cart',
    }
  )
);

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
