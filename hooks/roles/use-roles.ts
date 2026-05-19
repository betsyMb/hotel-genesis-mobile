import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENDPOINTS, RoleEntity } from '../api/types';

const ROLES_KEY = ['roles'];

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => api.get(ENDPOINTS.roles.base) as Promise<RoleEntity[]>,
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: [...ROLES_KEY, id],
    queryFn: () => api.get(ENDPOINTS.roles.byId(id)) as Promise<RoleEntity>,
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { role_name: string }) =>
      api.post(ENDPOINTS.roles.base, data) as Promise<RoleEntity>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoleEntity> }) =>
      api.patch(ENDPOINTS.roles.byId(id), data) as Promise<RoleEntity>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(ENDPOINTS.roles.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}
