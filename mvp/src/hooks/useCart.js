import { useState, useEffect } from 'react';

export function useCart() {
  // 1. Initialize state from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('storefront_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Sync to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('storefront_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 3. Add to cart (handles duplicates with the exact same customizations)
  const addToCart = (newItem) => {
    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          JSON.stringify(item.selectedOptionIds) === JSON.stringify(newItem.selectedOptionIds)
      );

      if (existingItemIndex >= 0) {
        // Increment quantity if the exact same product and options are already in the cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      // Otherwise, add it as a new line item
      return [...prevCart, newItem];
    });
  };

  // 4. Remove an item
  const removeFromCart = (productId, selectedOptionIds) => {
    setCartItems((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.productId === productId &&
            JSON.stringify(item.selectedOptionIds) === JSON.stringify(selectedOptionIds))
      )
    );
  };

  // 5. Update quantity
  const updateQuantity = (productId, selectedOptionIds, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId &&
        JSON.stringify(item.selectedOptionIds) === JSON.stringify(selectedOptionIds)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 6. Clear the cart (call this after a successful checkout)
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total items for a cart badge
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
  };
}