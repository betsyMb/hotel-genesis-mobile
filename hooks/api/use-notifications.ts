import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { ENDPOINTS } from './types';

const NOTIFICATIONS_KEY = ['notifications'];

export interface AppNotification {
  id_notification: number;
  id_user: number;
  title: string;
  message: string;
  is_read: boolean;
  id_reservation: number | null;
  created_at: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => api.get(`${ENDPOINTS.notifications.base}`) as Promise<AppNotification[]>,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => api.get(`${ENDPOINTS.notifications.unreadCount}`) as Promise<{ count: number }>,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.patch(ENDPOINTS.notifications.markRead(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch(ENDPOINTS.notifications.markAllRead, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
