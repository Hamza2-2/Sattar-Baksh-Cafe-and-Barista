import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [appliedVoucher, setAppliedVoucher] = useState(() => {
    const savedVoucher = localStorage.getItem('appliedVoucher');
    return savedVoucher ? JSON.parse(savedVoucher) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));
  }, [appliedVoucher]);

  const addToCart = (product, quantity) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedVoucher(null);
  };

  const applyVoucher = (voucherCode) => {
    const code = voucherCode.toUpperCase().trim();
    
    if (code === 'SAVE10') {
      setAppliedVoucher({
        code: 'SAVE10',
        discount: 10,
        type: 'percentage'
      });
      return { success: true, message: '10% discount applied!' };
    } else if (code === 'SAVE20') {
      setAppliedVoucher({
        code: 'SAVE20',
        discount: 20,
        type: 'percentage'
      });
      return { success: true, message: '20% discount applied!' };
    } else {
      return { success: false, message: 'Invalid voucher code' };
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const getCartTotals = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let discount = 0;
    if (appliedVoucher && appliedVoucher.type === 'percentage') {
      discount = (subtotal * appliedVoucher.discount) / 100;
    }
    
    const total = subtotal - discount;

    return {
      itemCount,
      subtotal,
      discount,
      total,
      appliedVoucher
    };
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      getCartTotals,
      applyVoucher,
      removeVoucher,
      appliedVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};