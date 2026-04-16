package iryna.samusieva.reservation_system.availability;

public record ChechAvailabilityResponse(
        String message,
        AvailabilityStatus status
) {
}
