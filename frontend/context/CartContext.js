import { createContext, useContext, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({}); // key = storeId, value = {store, products}

  const addToCart = (product, store) => {
    if (product.type === 'service') return;

    const storeId = store._id;

    setCart((prevCart) => {
      const storeCart = prevCart[storeId] || { store, products: [] };
      const existing = storeCart.products.find((p) => p._id === product._id);

      let updatedProducts;
      if (existing) {
        updatedProducts = storeCart.products.map((p) =>
          p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        updatedProducts = [...storeCart.products, { ...product, quantity: 1 }];
      }

      return {
        ...prevCart,
        [storeId]: {
          store,
          products: updatedProducts,
        },
      };
    });
  };
  const updateCartQuantity = (storeId, productId, newQty) => {
    setCart((prevCart) => {
      const storeCart = prevCart[storeId];
      if (!storeCart) return prevCart;
  
      const updatedProducts = storeCart.products.map((product) =>
        product._id === productId ? { ...product, quantity: newQty } : product
      );
  
      return {
        ...prevCart,
        [storeId]: {
          ...storeCart,
          products: updatedProducts,
        },
      };
    });
  };
  
  const removeFromCart = (storeId, productId) => {
    setCart((prevCart) => {
      const storeCart = prevCart[storeId];
      if (!storeCart) return prevCart;

      const updatedProducts = storeCart.products.filter((p) => p._id !== productId);
      if (updatedProducts.length === 0) {
        const newCart = { ...prevCart };
        delete newCart[storeId];
        return newCart;
      }

      return {
        ...prevCart,
        [storeId]: {
          ...storeCart,
          products: updatedProducts,
        },
      };
    });
  };

  const clearStoreCart = (storeId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      delete newCart[storeId];
      return newCart;
    });
  };

  const clearAllCart = () => {
    setCart({});
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart,updateCartQuantity, removeFromCart, clearStoreCart, clearAllCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
