package iryna.samusieva.reservation_system;

import iryna.samusieva.reservation_system.reservations.ReservationRole;

public record AuthenticatedUser(Long id, ReservationRole role) {
    public boolean isAdmin() {
        return role == ReservationRole.ADMIN;
    }
}
