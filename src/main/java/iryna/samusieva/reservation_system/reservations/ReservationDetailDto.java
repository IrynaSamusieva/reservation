package iryna.samusieva.reservation_system.reservations;

import java.time.LocalDate;

public record ReservationDetailDto(
        Long id,
        Long userId,
        String userName,
        Long roomId,
        String roomName,
        String roomNumber,
        LocalDate startDate,
        LocalDate endDate,
        ReservationStatus status
) {
}
