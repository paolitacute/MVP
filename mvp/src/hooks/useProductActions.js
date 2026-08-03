import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disableProduct, enableProduct, deleteProduct } from '../utils/productActions';

export const useProductActions = () => {
  const queryClient = useQueryClient();

  // Helper for consistent key invalidation
  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['homeData'] });
    queryClient.invalidateQueries({ queryKey: ['listing'] });
  };

  const disableMutation = useMutation({
    mutationFn: disableProduct,
    onSuccess: invalidateProducts,
  });

  const enableMutation = useMutation({
    mutationFn: enableProduct,
    onSuccess: invalidateProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: invalidateProducts,
  });

  return {
    disableProduct: disableMutation.mutateAsync,
    enableProduct: enableMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isPending: 
      disableMutation.isPending || 
      enableMutation.isPending || 
      deleteMutation.isPending,
  };
};