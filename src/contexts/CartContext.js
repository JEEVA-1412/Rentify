import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (equipment, rentalType, quantity, rentalDuration) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === equipment.id && item.rentalType === rentalType
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      
      return [...prev, {
        ...equipment,
        rentalType,
        quantity,
        rentalDuration,
        addedAt: new Date().toISOString(),
      }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const rate = item.rentalType === 'hourly' ? item.hourlyRate : item.dailyRate;
      return total + (rate * item.quantity * item.rentalDuration);
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getCartTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};