package iryna.samusieva.reservation_system;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/reservation")
public class ReservationController {
    private final Logger log = LoggerFactory.getLogger(ReservationController.class);
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> GetReservationById(@PathVariable("id") Long id) {
        log.info("hui");
        return ResponseEntity.ok(reservationService.getResetvationById(id)) ;
    }
    @GetMapping()
    public ResponseEntity<List<Reservation>> GetAllReservationById() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PostMapping()
    public ResponseEntity<Reservation> CreateReservation(@RequestBody Reservation reservationToCreate) {
        log.info("ReservationToCreate");
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("test", "123")
                .body(reservationService.createResevation(reservationToCreate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> UpdateReservation(
            @PathVariable("id") Long id,
            @RequestBody Reservation reservationToUpdate) {
        log.info("ReservationToUpdate");
        var updated = reservationService.reservationToUpdate(id, reservationToUpdate);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> DeleteReservation(@PathVariable("id") Long id) {
        log.info("ReservationToDelete");
        try{
            reservationService.reseravationToDelete(id);
            return ResponseEntity.ok().build();
        }catch(NoSuchElementException e){
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Reservation> AddReservation(@PathVariable("id") Long id) {
        log.info("ReservationToAdd");
        var added = reservationService.approveReservation(id);
        return ResponseEntity.ok(added);
    }
}
