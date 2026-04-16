package iryna.samusieva.reservation_system.reservations;

import org.springframework.web.bind.annotation.RequestParam;

public record ReservationSearchFilter(
        Long userId,
        Long roomId,
        Integer pageSize,
        Integer pageNumber
) {
}
