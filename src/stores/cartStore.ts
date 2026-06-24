import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  shopifyCartCreate, shopifyCartLinesAdd, shopifyCartLinesUpdate,
  shopifyCartLinesRemove, shopifyCartFetch,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image: string | null;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const cart = await shopifyCartCreate(item.variantId, item.quantity);
            if (!cart) return;
            const lineId = cart.lines[0]?.id ?? null;
            set({ cartId: cart.id, checkoutUrl: cart.checkoutUrl, items: [{ ...item, lineId }] });
          } else if (existing && existing.lineId) {
            const newQty = existing.quantity + item.quantity;
            const cart = await shopifyCartLinesUpdate(cartId, existing.lineId, newQty);
            if (!cart) return;
            if ("cartNotFound" in cart) { clearCart(); return; }
            set({ checkoutUrl: cart.checkoutUrl, items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i) });
          } else {
            const cart = await shopifyCartLinesAdd(cartId, item.variantId, item.quantity);
            if (!cart) return;
            if ("cartNotFound" in cart) { clearCart(); return; }
            const newLine = cart.lines.find((l) => l.merchandiseId === item.variantId);
            set({ checkoutUrl: cart.checkoutUrl, items: [...get().items, { ...item, lineId: newLine?.id ?? null }] });
          }
        } catch (e) { console.error("addItem:", e); }
        finally { set({ isLoading: false }); }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const cart = await shopifyCartLinesUpdate(cartId, item.lineId, quantity);
          if (!cart) return;
          if ("cartNotFound" in cart) { clearCart(); return; }
          set({ checkoutUrl: cart.checkoutUrl, items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i) });
        } finally { set({ isLoading: false }); }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const cart = await shopifyCartLinesRemove(cartId, item.lineId);
          if (!cart) return;
          if ("cartNotFound" in cart) { clearCart(); return; }
          const newItems = get().items.filter((i) => i.variantId !== variantId);
          if (newItems.length === 0) clearCart();
          else set({ checkoutUrl: cart.checkoutUrl, items: newItems });
        } finally { set({ isLoading: false }); }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const cart = await shopifyCartFetch(cartId);
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (e) { console.error("syncCart:", e); }
        finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: "fivea-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    },
  ),
);

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
