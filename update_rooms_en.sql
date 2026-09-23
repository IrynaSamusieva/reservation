-- ============================================================
-- Script to update existing rooms to English and add new rooms
-- Database: PostgreSQL (reservations)
-- Table: rooms
-- ============================================================

BEGIN;

-- 1. Insert new rooms or update existing ones (based on unique room_number)
INSERT INTO rooms (room_number, name, description, capacity, price_per_night, active)
VALUES
    -- Existing rooms translated to English
    ('101', 'Classic Room', 'A bright room with a double bed, comfortable seating, and breakfast included.', 2, 89.00, true),
    ('201', 'Comfort Room', 'A spacious room with a dedicated lounge area, courtyard view, and modern amenities.', 3, 119.00, true),
    ('301', 'Suite with Living Room', 'An elegant suite with a separate living room, panoramic windows, and thoughtful luxury details.', 4, 169.00, true),

    -- New rooms with various capacities, categories, and prices
    ('102', 'Standard Single Room', 'A cozy and quiet room designed for solo travelers, featuring a single bed, ergonomic workspace, and high-speed Wi-Fi.', 1, 65.00, true),
    ('103', 'Classic Twin Room', 'A welcoming room with two twin beds, large windows with garden views, and complimentary morning coffee.', 2, 95.00, true),
    ('202', 'Deluxe King Room', 'A stylish deluxe room featuring a king-size bed, private furnished balcony, and marble bathroom.', 2, 139.00, true),
    ('203', 'Family Comfort Room', 'An expansive family-friendly room with a queen bed and a pull-out sofa bed, plus a dining nook.', 4, 159.00, true),
    ('302', 'Executive Suite', 'A refined top-floor suite with a king bed, meeting lounge, walk-in closet, and whirlpool bath.', 3, 199.00, true),
    ('401', 'Presidential Penthouse', 'Exclusive rooftop penthouse featuring 360-degree panoramic views, private terrace, fireplace, and full concierge service.', 4, 299.00, true)
ON CONFLICT (room_number) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    price_per_night = EXCLUDED.price_per_night,
    active = EXCLUDED.active;

-- 2. Synchronize the primary key identity sequence with the max ID
SELECT setval(
    pg_get_serial_sequence('rooms', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM rooms), 1),
    true
);

COMMIT;

-- 3. Verify the updated rooms table
SELECT id, room_number, name, capacity, price_per_night, active
FROM rooms
ORDER BY id;
