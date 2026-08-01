import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

// --- Fetch Hook ---
export const useAccountSettings = () => {
  return useQuery({
    queryKey: ['accountSettings'],
    queryFn: async () => {
      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch seller information[cite: 14]
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      if (sellerError) throw sellerError;

      // 3. Fetch store information[cite: 14]
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('name, slug, phone, email, instagram, address, description, delivery')
        .eq('seller_id', user.id)
        .single();

      if (storeError && storeError.code !== 'PGRST116') { // Ignore error if they don't have a store yet[cite: 14]
        throw storeError;
      }

      return {
        seller: sellerData,
        store: storeData || null
      };
    }
  });
};

// --- Logout Mutation Hook ---
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Tell Supabase to destroy the session and clear local tokens[cite: 14]
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // 2. Clear all TanStack Query caches to prevent data leaks between sessions
      queryClient.clear();
    }
  });
};