package iryna.samusieva.reservation_system.login;

import iryna.samusieva.reservation_system.reservations.ReservationRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;

import java.time.LocalDate;

public record User(
        @Null
        Long id,
        @NotNull
        String usernamme,
        @NotNull
        String email,
        @NotNull
        String password,
        @NotNull
        ReservationRole role,
        @NotNull
        LocalDate loginTime
) {

}
