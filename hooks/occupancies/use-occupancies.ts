import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, Occupancy } from '../api/types';

const OCCUPANCIES_KEY = ['occupancies'];

export function useOccupancies() {
  return useQuery({
    queryKey: OCCUPANCIES_KEY,
    queryFn: () => api.get(ENDPOINTS.occupancies.base) as Promise<Occupancy[]>,
  });
}

export function useOccupancy(id: number) {
  return useQuery({
    queryKey: [...OCCUPANCIES_KEY, id],
    queryFn: () => api.get(ENDPOINTS.occupancies.byId(id)) as Promise<Occupancy>,
    enabled: !!id,
  });
}

export function useCreateOccupancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Occupancy, 'id_occupancy'>) =>
      api.post(ENDPOINTS.occupancies.base, data) as Promise<Occupancy>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OCCUPANCIES_KEY });
    },
  });
}

export function useUpdateOccupancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Occupancy> }) =>
      api.patch(ENDPOINTS.occupancies.byId(id), data) as Promise<Occupancy>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: OCCUPANCIES_KEY });
      queryClient.invalidateQueries({ queryKey: [...OCCUPANCIES_KEY, data.id_occupancy] });
    },
  });
}

export function useDeleteOccupancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.occupancies.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OCCUPANCIES_KEY });
    },
  });
}
