package iryna.samusieva.reservation_system.login;

import iryna.samusieva.reservation_system.reservations.ReservationRole;

public record UserResponse(
        Long id,
        String username,
        String email,
        ReservationRole role

) {}
