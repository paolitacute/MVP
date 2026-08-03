import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '../client'; // Ensure this path is correct

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('storefront_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem('storefront_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (i) => 
          i.productId === newItem.productId && 
          JSON.stringify(i.selectedOptionIds) === JSON.stringify(newItem.selectedOptionIds) &&
          (i.customMessage || '') === (newItem.customMessage || '') 
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (productId, selectedOptionIds, customMessage) => {
    setCartItems(prev => prev.filter(i => 
      !(i.productId === productId && 
        JSON.stringify(i.selectedOptionIds) === JSON.stringify(selectedOptionIds) &&
        (i.customMessage || '') === (customMessage || ''))
    ));
  };

  const updateQuantity = (productId, selectedOptionIds, customMessage, newQuantity) => {
    setCartItems(prev => prev.map(i => {
      if (
        i.productId === productId && 
        JSON.stringify(i.selectedOptionIds) === JSON.stringify(selectedOptionIds) &&
        (i.customMessage || '') === (customMessage || '')
      ) {
        return { ...i, quantity: newQuantity };
      }
      return i;
    }));
  }

  const clearCart = () => {
    setCartItems([]);
  };

  // TanStack Mutation for Checkout
  const checkoutMutation = useMutation({
    mutationFn: async (formData) => {
      const deliveryDateTimestamp = new Date(`${formData.neededBy}T12:00:00`).toISOString();

      const { data, error } = await supabase.rpc('checkout', {
        p_cart: {
          buyer: {
            name: formData.name,
            phone: formData.whatsapp,
            email: formData.email,
            address: formData.address,
          },
          deliverydate: deliveryDateTimestamp, 
          items: cartItems.map((ci) => ({
            productid: ci.productId,
            quantity: ci.quantity,
            optionids: ci.selectedOptionIds,
            custommessage: ci.customMessage,
          })),
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['homeData'],
        refetchType: 'all' 
      });
      
      // Clear the cart on successful checkout
      clearCart();
    },
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    checkout: checkoutMutation.mutateAsync,
    isCheckingOut: checkoutMutation.isPending,
  };
}