export interface WalkInGuest {
  first_name: string;
  last_name: string;
  dni: string;
  phone_number: string;
}

export interface WalkInCheckinPayload {
  room_id: number;
  service_type?: 'nightly' | '3hours';
  guest: {
    first_name: string;
    last_name: string;
    dni: string;
    phone_number?: string;
  };
  additional_guests?: Array<{
    first_name: string;
    last_name: string;
    dni: string;
  }>;
}

export interface WalkInCheckinResponse {
  message: string;
  occupancy_id: number;
  room_id: number;
  room_number: string;
  user_id: number;
  user_created: boolean;
  guest_count: number;
}

export interface WalkInCheckoutPayload {
  room_id: number;
}

export interface WalkInCheckoutResponse {
  message: string;
  room_id: number;
  room_number: string;
  occupancy_id: number;
  total_nights: number;
  service_type?: 'nightly' | '3hours';
  checked_in: string;
  checked_out: string;
}

export interface WalkInHistoryGuest {
  full_name: string;
  dni: string;
  phone: string;
}

export interface WalkInHistoryItem {
  id_occupancy: number;
  room_id: number;
  room_number: string;
  room_type: string;
  guest_signature: string;
  guests: WalkInHistoryGuest[];
  total_nights: number;
  service_type?: 'nightly' | '3hours';
  checked_in: string;
  checked_out: string;
}
