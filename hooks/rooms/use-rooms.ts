import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, Room } from '../api/types';

const ROOMS_KEY = ['rooms'];

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_KEY,
    queryFn: () => api.get(ENDPOINTS.rooms.base) as Promise<Room[]>,
  });
}

export function useRoom(id: number) {
  return useQuery({
    queryKey: [...ROOMS_KEY, id],
    queryFn: () => api.get(ENDPOINTS.rooms.byId(id)) as Promise<Room>,
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Room, 'id_room'>) =>
      api.post(ENDPOINTS.rooms.base, data) as Promise<Room>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Room> }) =>
      api.patch(ENDPOINTS.rooms.byId(id), data) as Promise<Room>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ROOMS_KEY, data.id_room] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.rooms.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
    },
  });
}
