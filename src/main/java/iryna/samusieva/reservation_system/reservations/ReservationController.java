package iryna.samusieva.reservation_system.reservations;


import iryna.samusieva.reservation_system.AuthenticatedUser;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/reservation")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {
    private final Logger log = LoggerFactory.getLogger(ReservationController.class);
    private final ReservationService reservationService;


    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;

    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> GetReservationByUserId(@PathVariable("id") Long id,
                                                              @AuthenticationPrincipal AuthenticatedUser user) {
        log.info("getId");

        var reservation = reservationService.getResetvationById(id);
        if (!user.isAdmin() && !reservation.userId().equals(user.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reservation);
    }
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> GetAllReservationById(
            @RequestParam(name = "roomId", required = false)Long roomId,
            @RequestParam(name = "pageSize", required = false)Integer pageSize,
            @RequestParam(name = "pageNumber", required = false)Integer pageNumber
            ) {
        var filter = new ReservationSearchFilter(null, roomId, pageSize, pageNumber);
        return ResponseEntity.ok(reservationService.searchByFilter(filter));
    }

    @PostMapping()
    public ResponseEntity<Reservation> CreateReservation(@RequestBody @Valid Reservation reservationToCreate,
                                                         @AuthenticationPrincipal AuthenticatedUser user) {
        log.info("ReservationToCreate");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createResevation(reservationToCreate, user.id()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> UpdateReservation(
            @PathVariable("id") Long id,
            @RequestBody @Valid Reservation reservationToUpdate,
            @AuthenticationPrincipal AuthenticatedUser user) {
        log.info("ReservationToUpdate");
        var updated = reservationService.reservationToUpdate(id, reservationToUpdate, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> DeleteReservation(@PathVariable("id") Long id) {
        log.info("ReservationToDelete");
            reservationService.reseravationToDelete(id);
            return ResponseEntity.noContent().build();

    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> AddReservation(@PathVariable("id") Long id) {
        log.info("ReservationToAdd");
        var added = reservationService.approveReservation(id);
        return ResponseEntity.ok(added);
    }
}
