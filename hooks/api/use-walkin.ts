import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { ENDPOINTS } from './types';
import {
  WalkInCheckinPayload,
  WalkInCheckinResponse,
  WalkInCheckoutPayload,
  WalkInCheckoutResponse,
  WalkInHistoryItem,
} from './walkin-types';

const ROOMS_KEY = ['rooms'];
const OCCUPANCIES_KEY = ['occupancies'];

export function useWalkinHistory() {
  return useQuery({
    queryKey: [...OCCUPANCIES_KEY, 'walkin', 'history'],
    queryFn: () => api.get(ENDPOINTS.walkin.history) as Promise<WalkInHistoryItem[]>,
  });
}

export function useWalkinCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalkInCheckinPayload) =>
      api.post(ENDPOINTS.walkin.checkin, data) as Promise<WalkInCheckinResponse>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: OCCUPANCIES_KEY });
    },
  });
}

export function useWalkinCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalkInCheckoutPayload) =>
      api.post(ENDPOINTS.walkin.checkout, data) as Promise<WalkInCheckoutResponse>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: OCCUPANCIES_KEY });
    },
  });
}
