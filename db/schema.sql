-- =============================================
-- HOTEL DATABASE SCHEMA
-- PostgreSQL + Docker
-- =============================================

-- Enable UUID extension (optional, for advanced IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ROLES TABLE
-- =============================================
CREATE TABLE roles (
                       id_rol SERIAL PRIMARY KEY,
                       role_name VARCHAR(50) NOT NULL UNIQUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. USERS TABLE
-- =============================================
CREATE TABLE users (
                       id_user SERIAL PRIMARY KEY,
                       full_name VARCHAR(100) NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       phone VARCHAR(20),
                       password_hash VARCHAR(255) NOT NULL,
                       id_rol INTEGER NOT NULL REFERENCES roles(id_rol) ON DELETE RESTRICT,
                       is_active BOOLEAN DEFAULT true,
                       last_login TIMESTAMP,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. ROOMS TABLE
-- =============================================
CREATE TABLE rooms (
                       id_room SERIAL PRIMARY KEY,
                       room_number VARCHAR(10) NOT NULL UNIQUE,
                       room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('simple', 'double', 'suite', 'family')),
                       floor INTEGER NOT NULL,
                       price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
                       description TEXT,
                       capacity INTEGER DEFAULT 2,
                       square_meters INTEGER,
                       has_view BOOLEAN DEFAULT false,
                       has_balcony BOOLEAN DEFAULT false,
                       room_status VARCHAR(20) DEFAULT 'available' CHECK (room_status IN ('available', 'occupied', 'maintenance', 'reserved')),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. RESERVATIONS TABLE
-- =============================================
CREATE TABLE reservations (
                              id_reservation SERIAL PRIMARY KEY,
                              id_client INTEGER NOT NULL REFERENCES users(id_user) ON DELETE RESTRICT,
                              id_room INTEGER NOT NULL REFERENCES rooms(id_room) ON DELETE RESTRICT,
                              check_in_date DATE NOT NULL,
                              check_out_date DATE NOT NULL,
                              number_of_guests INTEGER DEFAULT 1,
                              reservation_status VARCHAR(20) DEFAULT 'pending' CHECK (reservation_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
                              reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
                              notes TEXT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

-- =============================================
-- 5. OCCUPANCIES TABLE (Check-in/Check-out real)
-- =============================================
CREATE TABLE occupancies (
                             id_occupancy SERIAL PRIMARY KEY,
                             id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
                             id_room INTEGER NOT NULL REFERENCES rooms(id_room) ON DELETE RESTRICT,
                             actual_check_in TIMESTAMP NOT NULL,
                             actual_check_out TIMESTAMP,
                             occupancy_status VARCHAR(20) DEFAULT 'active' CHECK (occupancy_status IN ('active', 'completed', 'no_show')),
                             guest_signature TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
                          id_payment SERIAL PRIMARY KEY,
                          id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
                          amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
                          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'crypto')),
                          payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'failed')),
                          transaction_id VARCHAR(100),
                          receipt_url TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. INCIDENTS TABLE (Maintenance issues)
-- =============================================
CREATE TABLE incidents (
                           id_incident SERIAL PRIMARY KEY,
                           id_room INTEGER NOT NULL REFERENCES rooms(id_room) ON DELETE CASCADE,
                           id_reporter INTEGER NOT NULL REFERENCES users(id_user) ON DELETE RESTRICT,
                           description TEXT NOT NULL,
                           priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
                           incident_status VARCHAR(20) DEFAULT 'pending' CHECK (incident_status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
                           report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           resolution_date TIMESTAMP,
                           resolution_notes TEXT,
                           id_assigned_to INTEGER REFERENCES users(id_user) ON DELETE SET NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. SERVICES TABLE (Extra services like spa, restaurant)
-- =============================================
CREATE TABLE services (
                          id_service SERIAL PRIMARY KEY,
                          service_name VARCHAR(100) NOT NULL,
                          description TEXT,
                          price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
                          is_active BOOLEAN DEFAULT true,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. RESERVATION_SERVICES TABLE (Many-to-many)
-- =============================================
CREATE TABLE reservation_services (
                                      id_reservation_service SERIAL PRIMARY KEY,
                                      id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
                                      id_service INTEGER NOT NULL REFERENCES services(id_service) ON DELETE RESTRICT,
                                      quantity INTEGER DEFAULT 1,
                                      price_at_time DECIMAL(10,2) NOT NULL,
                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      UNIQUE(id_reservation, id_service)
);

-- =============================================
-- 10. PROMOTIONS TABLE
-- =============================================
CREATE TABLE promotions (
                            id_promotion SERIAL PRIMARY KEY,
                            promotion_code VARCHAR(50) NOT NULL UNIQUE,
                            description TEXT,
                            discount_percent DECIMAL(5,2) CHECK (discount_percent BETWEEN 0 AND 100),
                            discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
                            start_date DATE NOT NULL,
                            end_date DATE NOT NULL,
                            min_nights INTEGER DEFAULT 1,
                            max_usage INTEGER,
                            times_used INTEGER DEFAULT 0,
                            is_active BOOLEAN DEFAULT true,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT check_discount CHECK (
                                (discount_percent IS NOT NULL AND discount_amount IS NULL) OR
                                (discount_percent IS NULL AND discount_amount IS NOT NULL)
                                )
);

-- =============================================
-- 11. RESERVATION_PROMOTIONS TABLE
-- =============================================
CREATE TABLE reservation_promotions (
                                        id_reservation_promotion SERIAL PRIMARY KEY,
                                        id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
                                        id_promotion INTEGER NOT NULL REFERENCES promotions(id_promotion) ON DELETE RESTRICT,
                                        discount_applied DECIMAL(10,2) NOT NULL,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 12. INVOICES TABLE
-- =============================================
CREATE TABLE invoices (
                          id_invoice SERIAL PRIMARY KEY,
                          id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE RESTRICT,
                          invoice_number VARCHAR(50) NOT NULL UNIQUE,
                          issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          total_amount DECIMAL(10,2) NOT NULL,
                          tax_amount DECIMAL(10,2) DEFAULT 0,
                          pdf_url TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 13. AUDIT LOGS TABLE (For tracking changes)
-- =============================================
CREATE TABLE audit_logs (
                            id_audit SERIAL PRIMARY KEY,
                            table_name VARCHAR(50) NOT NULL,
                            record_id INTEGER NOT NULL,
                            action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    id_user INTEGER REFERENCES users(id_user) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INSERT INITIAL DATA
-- =============================================

-- Insert roles
INSERT INTO roles (role_name) VALUES
                                  ('Administrator'),
                                  ('Receptionist'),
                                  ('Client'),
                                  ('Maintenance'),
                                  ('Manager');

-- Insert sample users (passwords are hashed, use 'password123' as example)
INSERT INTO users (full_name, email, phone, password_hash, id_rol, is_active) VALUES
                                                                                  ('Admin User', 'admin@hotel.com', '+1234567890', '$2a$10$H7P6N5M4L3K2J1I0O9I8U7Y6T5R4E3W2Q1Z0X9C8V7B6N5M4L3K2J1H', 1, true),
                                                                                  ('John Client', 'client@hotel.com', '+1234567891', '$2a$10$H7P6N5M4L3K2J1I0O9I8U7Y6T5R4E3W2Q1Z0X9C8V7B6N5M4L3K2J1H', 3, true);

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, floor, price_per_night, description, capacity, square_meters, has_view, has_balcony) VALUES
                                                                                                                                    ('101', 'simple', 1, 80.00, 'Cozy single room with city view', 1, 20, true, false),
                                                                                                                                    ('102', 'double', 1, 120.00, 'Comfortable double room', 2, 25, false, true),
                                                                                                                                    ('201', 'suite', 2, 250.00, 'Luxury suite with panoramic view', 4, 50, true, true),
                                                                                                                                    ('202', 'family', 2, 180.00, 'Spacious family room', 4, 40, true, false),
                                                                                                                                    ('301', 'double', 3, 150.00, 'Premium double with balcony', 2, 30, true, true),
                                                                                                                                    ('302', 'simple', 3, 90.00, 'Simple room with mountain view', 1, 22, true, false);

-- Insert sample services
INSERT INTO services (service_name, description, price, is_active) VALUES
                                                                       ('Breakfast Buffet', 'International breakfast buffet', 15.00, true),
                                                                       ('Spa Access', 'Full access to spa facilities', 50.00, true),
                                                                       ('Airport Transfer', 'Pickup/dropoff from airport', 40.00, true),
                                                                       ('Room Service', '24/7 room service', 10.00, true);

-- Insert sample promotion
INSERT INTO promotions (promotion_code, description, discount_percent, start_date, end_date, min_nights, max_usage) VALUES
    ('WELCOME10', '10% off for new guests', 10.00, '2026-01-01', '2026-12-31', 2, 100);