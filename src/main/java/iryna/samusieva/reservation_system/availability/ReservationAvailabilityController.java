package iryna.samusieva.reservation_system.availability;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
@RequestMapping("/reservatiom/availability")
public class ReservationAvailabilityController {
    private final ReservationavailabilityService service;
    private static final Logger log = Logger.getLogger(ReservationAvailabilityController.class.getName());
    public ReservationAvailabilityController(ReservationavailabilityService service) {
        this.service = service;
    }
    public ResponseEntity<ChechAvailabilityResponse> checkAvailability(
           @Valid CheckAvailabilityRequest request
    ){
        log.info("checkAvailability: " + request);
        boolean isAvailable = service.isReservationAvailable(
                request.roomId(), request.startDate(), request.endDate()
        );
        var message = isAvailable ? "Reservation is available" : "Reservation is not available";
        var status = isAvailable ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.RESERVED;
        return ResponseEntity.status(HttpStatus.OK).body(
                new ChechAvailabilityResponse(message, status));
    }
}
