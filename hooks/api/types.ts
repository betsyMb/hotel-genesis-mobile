const BASE_URL = 'http://localhost:3000';
// const BASE_URL = 'http://192.168.68.100:3000';

export const ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
  },
  roles: {
    base: `${BASE_URL}/roles`,
    byId: (id: number) => `${BASE_URL}/roles/${id}`,
  },
  users: {
    base: `${BASE_URL}/users`,
    byId: (id: number) => `${BASE_URL}/users/${id}`,
  },
  rooms: {
    base: `${BASE_URL}/rooms`,
    byId: (id: number) => `${BASE_URL}/rooms/${id}`,
  },
  reservations: {
    base: `${BASE_URL}/reservations`,
    byId: (id: number) => `${BASE_URL}/reservations/${id}`,
  },
  occupancies: {
    base: `${BASE_URL}/occupancies`,
    byId: (id: number) => `${BASE_URL}/occupancies/${id}`,
  },
  services: {
    base: `${BASE_URL}/services`,
    byId: (id: number) => `${BASE_URL}/services/${id}`,
  },
  promotions: {
    base: `${BASE_URL}/promotions`,
    byId: (id: number) => `${BASE_URL}/promotions/${id}`,
  },
  walkin: {
    checkin: `${BASE_URL}/walkin/checkin`,
    checkout: `${BASE_URL}/walkin/checkout`,
    history: `${BASE_URL}/walkin/history`,
  },
} as const;

export type Role = 'Administrator' | 'Manager' | 'Receptionist' | 'Client' | 'Maintenance';

export interface User {
  id_user: number;
  full_name: string;
  email: string;
  role: Role;
  id_rol: number;
  phone?: string;
  is_active?: boolean;
}

export interface Room {
  id_room: number;
  room_number: string;
  room_type: 'simple' | 'double' | 'suite' | 'family';
  floor: number;
  price_per_night: number;
  description?: string;
  capacity?: number;
  square_meters?: number;
  has_view?: boolean;
  has_balcony?: boolean;
  room_status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface Reservation {
  id_reservation: number;
  id_client: number;
  id_room: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests?: number;
  reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  total_amount: number;
  notes?: string;
  client?: User;
  room?: Room;
}

export interface Occupancy {
  id_occupancy: number;
  id_reservation: number | null;
  id_room: number;
  actual_check_in: string;
  actual_check_out?: string;
  occupancy_status: 'active' | 'completed' | 'no_show';
  guest_signature?: string;
  room?: Room;
  reservation?: Reservation | null;
}

export interface Service {
  id_service: number;
  service_name: string;
  description?: string;
  price: number;
  is_active: boolean;
}

export interface Promotion {
  id_promotion: number;
  promotion_code: string;
  description?: string;
  discount_percent?: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  min_nights?: number;
  max_usage?: number;
  is_active: boolean;
}

export interface RoleEntity {
  id_rol: number;
  role_name: string;
}
