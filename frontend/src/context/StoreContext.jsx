import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export const StoreContext = createContext(null);

const CART_STORAGE_KEY = "foodDelCart";
export const DELIVERY_FEE = 2;

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodsError, setFoodsError] = useState(null);
  const [cartItems, setCartItem] = useState(loadCartFromStorage);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await apiFetch("/foods");
        if (!cancelled) {
          setFoodList(json.data || []);
          setFoodsError(null);
        }
      } catch (e) {
        if (!cancelled) setFoodsError(e.message || "Could not load menu.");
      } finally {
        if (!cancelled) setFoodsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemId) => {
    setCartItem((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItem((prev) => {
      const next = { ...prev };
      if (!next[itemId]) return prev;
      next[itemId] -= 1;
      if (next[itemId] <= 0) delete next[itemId];
      return next;
    });
  };

  const clearCart = () => setCartItem({});

  const getTotalCartAmount = () => {
    let total = 0;
    for (const item of food_list) {
      const qty = cartItems[item._id];
      if (qty > 0) total += item.price * qty;
    }
    return total;
  };

  const getCartItemCount = () =>
    Object.values(cartItems).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);

  const contextValue = {
    food_list,
    foodsLoading,
    foodsError,
    cartItems,
    setCartItem,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    getCartItemCount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
