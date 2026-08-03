import { supabase } from '../supabaseClient';

export const disableStore = async (storeId) => {
  const { error } = await supabase.rpc('disablestore', { p_storeid: storeId });
  if (error) throw error;
};

export const enableStore = async (storeId) => {
  const { error } = await supabase.rpc('enablestore', { p_storeid: storeId });
  if (error) throw error;
};

export const deleteStore = async (storeId) => {
  const { error } = await supabase.rpc('deletestore', { p_storeid: storeId });
  if (error) throw error;
};