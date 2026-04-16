package iryna.samusieva.reservation_system.web;

import java.time.LocalDateTime;

public record ErrorResponseDto(
        String message,
        String errorMessage,
        LocalDateTime errorTime
) {

}
