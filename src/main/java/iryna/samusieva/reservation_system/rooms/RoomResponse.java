package iryna.samusieva.reservation_system.rooms;

import java.math.BigDecimal;

public record RoomResponse(
        Long id,
        String roomNumber,
        String name,
        String description,
        Integer capacity,
        BigDecimal pricePerNight,
        String imageUrl,
        Boolean active
) {
    public static RoomResponse fromEntity(RoomEntity entity) {
        return new RoomResponse(
                entity.getId(),
                entity.getRoomNumber(),
                entity.getName(),
                entity.getDescription(),
                entity.getCapacity(),
                entity.getPricePerNight(),
                entity.getImageUrl(),
                entity.getActive()
        );
    }
}
