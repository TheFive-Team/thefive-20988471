import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  slug: string;
  size: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (slug: string, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "fiveA_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add: CartCtx["add"] = (slug, size, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.slug === slug && x.size === size);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { slug, size, qty }];
    });
  };

  const remove: CartCtx["remove"] = (slug, size) =>
    setItems((p) => p.filter((x) => !(x.slug === slug && x.size === size)));

  const setQty: CartCtx["setQty"] = (slug, size, qty) =>
    setItems((p) => p.map((x) => (x.slug === slug && x.size === size ? { ...x, qty: Math.max(1, qty) } : x)));

  const clear = () => setItems([]);
  const count = items.reduce((a, b) => a + b.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
