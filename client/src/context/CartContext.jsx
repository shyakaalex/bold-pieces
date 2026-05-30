import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "bp_cart";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (items.some((item) => Number(item.price) < 10000)) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return items;
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((previous) => {
      const existing = previous.find((item) => item._id === product._id);
      if (existing) {
        return previous.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...previous, { ...product, qty }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((previous) =>
      previous
        .map((item) => (item._id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((previous) => previous.filter((item) => item._id !== id));
  };

  const clearCart = () => setCart([]);

  const value = {
    cart,
    cartOpen,
    setCartOpen,
    cartTotal,
    cartCount,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
