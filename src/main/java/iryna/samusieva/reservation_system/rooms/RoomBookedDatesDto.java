package iryna.samusieva.reservation_system.rooms;

import iryna.samusieva.reservation_system.reservations.ReservationStatus;
import java.time.LocalDate;

public record RoomBookedDatesDto(
        LocalDate startDate,
        LocalDate endDate,
        ReservationStatus status
) {}
