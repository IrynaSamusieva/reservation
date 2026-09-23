- ============================================================
-- Migration: Add image_url to rooms and populate with Cloudflare R2 links
-- ============================================================

BEGIN;

-- 1. Add image_url column if not exists
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- 2. Insert or update all 12 rooms with Cloudflare R2 images
INSERT INTO rooms (room_number, name, description, capacity, price_per_night, image_url, active)
VALUES
    ('101', 'Classic Room', 'A bright room with a double bed, comfortable seating, and breakfast included.', 2, 89.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images.jpeg', true),
    ('102', 'Standard Single Room', 'A cozy and quiet room designed for solo travelers, featuring a single bed, ergonomic workspace, and high-speed Wi-Fi.', 1, 65.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(1).jpeg', true),
    ('103', 'Classic Twin Room', 'A welcoming room with two twin beds, large windows with garden views, and complimentary morning coffee.', 2, 95.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(2).jpeg', true),
    ('201', 'Comfort Room', 'A spacious room with a dedicated lounge area, courtyard view, and modern amenities.', 3, 119.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(3).jpeg', true),
    ('202', 'Deluxe King Room', 'A stylish deluxe room featuring a king-size bed, private furnished balcony, and marble bathroom.', 2, 139.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(4).jpeg', true),
    ('203', 'Family Comfort Room', 'An expansive family-friendly room with a queen bed and a pull-out sofa bed, plus a dining nook.', 4, 159.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(5).jpeg', true),
    ('301', 'Suite with Living Room', 'An elegant suite with a separate living room, panoramic windows, and thoughtful luxury details.', 4, 169.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(6).jpeg', true),
    ('302', 'Executive Suite', 'A refined top-floor suite with a king bed, meeting lounge, walk-in closet, and whirlpool bath.', 3, 199.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(7).jpeg', true),
    ('401', 'Presidential Penthouse', 'Exclusive rooftop penthouse featuring 360-degree panoramic views, private terrace, fireplace, and full concierge service.', 4, 299.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(8).jpeg', true),
    ('402', 'Skyline Studio', 'A modern studio with floor-to-ceiling windows, city views, and open-plan kitchen-living area.', 2, 179.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(9).jpeg', true),
    ('501', 'Honeymoon Loft', 'A romantic loft featuring sloped ceilings, ambient lighting, freestanding bathtub, and champagne on arrival.', 2, 220.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(10).jpeg', true),
    ('502', 'Grand Royal Suite', 'The pinnacle of luxury accommodation with master bedroom, guest room, private sauna, and butler service.', 6, 390.00, 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(11).jpeg', true)
ON CONFLICT (room_number) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    price_per_night = EXCLUDED.price_per_night,
    image_url = EXCLUDED.image_url,
    active = EXCLUDED.active;

-- 3. Synchronize identity sequence
SELECT setval(
    pg_get_serial_sequence('rooms', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM rooms), 1),
    true
);

COMMIT;

-- 4. Verify
SELECT id, room_number, name, capacity, price_per_night, image_url
FROM rooms
ORDER BY id;
