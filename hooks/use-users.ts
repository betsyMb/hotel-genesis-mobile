import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api/client';
import { ENDPOINTS, User } from './api/types';

const USERS_KEY = ['users'];

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const data = await api.get(ENDPOINTS.users.base) as any[];
      return data.map((u) => ({
        ...u,
        role: u.role?.role_name ?? u.role,
      })) as User[];
    },
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => api.get(ENDPOINTS.users.byId(id)) as Promise<User>,
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<User, 'id_user'> & { password_hash: string }) =>
      api.post(ENDPOINTS.users.base, data) as Promise<User>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> & { password_hash?: string } }) =>
      api.patch(ENDPOINTS.users.byId(id), data) as Promise<User>,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_KEY, data.id_user] })},
    onError: (err) => console.log("ERRORORR", {err})
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.users.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
