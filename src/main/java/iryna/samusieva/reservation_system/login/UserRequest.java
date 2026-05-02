package iryna.samusieva.reservation_system.login;

public record UserRequest(
        String username,
        String email,
        String password
) {}
