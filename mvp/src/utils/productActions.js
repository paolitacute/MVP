import { supabase } from '../client';

export const disableProduct = async (productId) => {
  const { error } = await supabase.rpc('disableproduct', { p_productid: productId });
  if (error) throw error;
};

export const enableProduct = async (productId) => {
  const { error } = await supabase.rpc('enableproduct', { p_productid: productId });
  if (error) throw error;
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase.rpc('deleteproduct', { p_productid: productId });
  if (error) throw error;
};