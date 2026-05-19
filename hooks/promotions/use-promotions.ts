import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, Promotion } from '../api/types';

const PROMOTIONS_KEY = ['promotions'];

export function usePromotions() {
  return useQuery({
    queryKey: PROMOTIONS_KEY,
    queryFn: () => api.get(ENDPOINTS.promotions.base) as Promise<Promotion[]>,
  });
}

export function usePromotion(id: number) {
  return useQuery({
    queryKey: [...PROMOTIONS_KEY, id],
    queryFn: () => api.get(ENDPOINTS.promotions.byId(id)) as Promise<Promotion>,
    enabled: !!id,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Promotion, 'id_promotion'>) =>
      api.post(ENDPOINTS.promotions.base, data) as Promise<Promotion>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Promotion> }) =>
      api.patch(ENDPOINTS.promotions.byId(id), data) as Promise<Promotion>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROMOTIONS_KEY, data.id_promotion] });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.promotions.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY });
    },
  });
}
