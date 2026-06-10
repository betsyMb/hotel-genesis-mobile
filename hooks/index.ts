export { AuthProvider, useAuth } from './auth/use-auth';

export { useRooms, useRoom, useCreateRoom, useUpdateRoom, useDeleteRoom, useUpdateRoomTasks } from './rooms/use-rooms';
export { useReservations, useReservation, useCreateReservation, useUpdateReservation, useDeleteReservation } from './reservations/use-reservations';
export { useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser } from './use-users';
export { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole } from './roles/use-roles';
export { useServices, useService, useCreateService, useUpdateService, useDeleteService } from './services/use-services';
export { usePromotions, usePromotion, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from './promotions/use-promotions';
export { useOccupancies, useOccupancy, useCreateOccupancy, useUpdateOccupancy, useDeleteOccupancy } from './occupancies/use-occupancies';
export { useWalkinCheckin, useWalkinCheckout, useWalkinHistory } from './api/use-walkin';
export { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from './api/use-notifications';
export { useBiometric } from './use-biometric';
export { useExchangeRate } from './use-exchange-rate';

export { api } from './api/client';
export { QueryProvider } from './providers/query-provider';

export type {
  User,
  Room,
  Reservation,
  Occupancy,
  Service,
  Promotion,
  RoleEntity,
  Role,
} from './api/types';
