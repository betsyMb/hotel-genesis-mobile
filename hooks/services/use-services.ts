import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, Service } from '../api/types';

const SERVICES_KEY = ['services'];

export function useServices() {
  return useQuery({
    queryKey: SERVICES_KEY,
    queryFn: () => api.get(ENDPOINTS.services.base) as Promise<Service[]>,
  });
}

export function useService(id: number) {
  return useQuery({
    queryKey: [...SERVICES_KEY, id],
    queryFn: () => api.get(ENDPOINTS.services.byId(id)) as Promise<Service>,
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Service, 'id_service'>) =>
      api.post(ENDPOINTS.services.base, data) as Promise<Service>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) =>
      api.patch(ENDPOINTS.services.byId(id), data) as Promise<Service>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      queryClient.invalidateQueries({ queryKey: [...SERVICES_KEY, data.id_service] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.services.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}
