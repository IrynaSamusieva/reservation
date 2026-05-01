package iryna.samusieva.reservation_system.reservations;


import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Reservation> GetReservationById(@PathVariable("id") Long id) {
        log.info("getId");
        return ResponseEntity.ok(reservationService.getResetvationById(id)) ;
    }
    @GetMapping()
    public ResponseEntity<List<Reservation>> GetAllReservationById(
            @RequestParam(name ="userId", required = false)Long userId,
            @RequestParam(name = "roomId", required = false)Long roomId,
            @RequestParam(name = "pageSize", required = false)Integer pageSize,
            @RequestParam(name = "pageNumber", required = false)Integer pageNumber
            ) {
        var filter = new ReservationSearchFilter(userId, roomId, pageSize, pageNumber);
        return ResponseEntity.ok(reservationService.searchByFilter(filter));
    }

    @PostMapping()
    public ResponseEntity<Reservation> CreateReservation(@RequestBody @Valid Reservation reservationToCreate) {
        log.info("ReservationToCreate");
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("test", "123")
                .body(reservationService.createResevation(reservationToCreate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> UpdateReservation(
            @PathVariable("id") Long id,
            @RequestBody @Valid Reservation reservationToUpdate) {
        log.info("ReservationToUpdate");
        var updated = reservationService.reservationToUpdate(id, reservationToUpdate);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/reject")
    public ResponseEntity<Void> DeleteReservation(@PathVariable("id") Long id) {
        log.info("ReservationToDelete");
            reservationService.reseravationToDelete(id);
            return ResponseEntity.status(500).build();

    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Reservation> AddReservation(@PathVariable("id") Long id) {
        log.info("ReservationToAdd");
        var added = reservationService.approveReservation(id);
        return ResponseEntity.ok(added);
    }
}
