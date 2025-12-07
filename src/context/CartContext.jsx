import { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + qty } : p,
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id, qty) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items],
  );

  return (
    <CartCtx.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clear, total }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
