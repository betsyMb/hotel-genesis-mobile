import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, Reservation } from '../api/types';

const RESERVATIONS_KEY = ['reservations'];

export function useReservations() {
  return useQuery({
    queryKey: RESERVATIONS_KEY,
    queryFn: () => api.get(ENDPOINTS.reservations.base) as Promise<Reservation[]>,
  });
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: [...RESERVATIONS_KEY, id],
    queryFn: () => api.get(ENDPOINTS.reservations.byId(id)) as Promise<Reservation>,
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Reservation, 'id_reservation'>) =>
      api.post(ENDPOINTS.reservations.base, data) as Promise<Reservation>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Reservation> }) =>
      api.patch(ENDPOINTS.reservations.byId(id), data) as Promise<Reservation>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: [...RESERVATIONS_KEY, data.id_reservation] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.reservations.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
}
