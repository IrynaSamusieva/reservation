package iryna.samusieva.reservation_system;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class ReservationService {
   private final Map<Long, Reservation> reservations;
   private final AtomicLong idCounter;
   private final ReservationRepository reservation;

    public ReservationService(ReservationRepository reservation) {
        this.reservation = reservation;
        reservations = new HashMap<>();
        idCounter = new AtomicLong();
    }

    public Reservation reservationToUpdate(Long id, Reservation reservationToUpdate) {
        if(!reservations.containsKey(id)){
            throw new NoSuchElementException("Reservation not found");
        }
        if(reservations.get(id).status() != ReservationStatus.PENDING){
            throw new IllegalStateException("Its status is not PENDING");
        }
        else{
            var reservation = reservations.get(id);
            var updated = new Reservation(
                    reservation.id(),
                    reservationToUpdate.userId(),
                    reservationToUpdate.roomId(),
                    reservationToUpdate.startDate(),
                    reservationToUpdate.endDate(),
                    ReservationStatus.PENDING
            );
            reservations.put(id, updated);
            return updated;
        }
    }

    public void reseravationToDelete(Long id) {
        if(!reservations.containsKey(id)){
            throw new NoSuchElementException("ReservationToDelete not found");
        }
        reservations.remove(id);
    }

    public Reservation getResetvationById(Long id) {
        if(!reservations.containsKey(id)){
            throw new NoSuchElementException("Reservation not found");
        }
        return reservations.get(id);


    }
    public List<Reservation> getAllReservations() {
        List<ReservationEntity> allReservations = reservation.findAll();
        List<Reservation> result = allReservations.stream()
                .map(it ->
                    new Reservation( it.getId(),
                            it.getUserId(),
                            it.getRoomId(),
                            it.getStartDate(),
                            it.getEndDate(),
                            it.getStatus()
                )
                ).toList();

      return result;
    }

    public Reservation createResevation(Reservation reservation) {
        if(reservation.id() != null){
            throw new IllegalArgumentException("You cant input your own id");
        }
        if(reservation.status() != null){
            throw new IllegalArgumentException("You cant input your own status");
        }

           var res =   new Reservation(
                        idCounter.incrementAndGet(),
                        reservation.userId(),
                        reservation.roomId(),
                        reservation.startDate(),
                        reservation.endDate(),
                        ReservationStatus.PENDING
                );

        reservations.put(res.id(), res);
        return reservations.get(res.id());
    }

    public Reservation approveReservation(Long id) {
        if(!reservations.containsKey(id)){
            throw new NoSuchElementException("Reservation not found");
        }

        var res = reservations.get(id);

        if(res.status() != ReservationStatus.PENDING){
            throw new IllegalStateException("Cannot approve reservation with status: " + res.status());
        }

        if(hasConflictWithApproved(res)){
            throw new IllegalStateException("Reservation conflicts with existing approved reservation");
        }

        var approved = new Reservation(
                res.id(),
                res.userId(),
                res.roomId(),
                res.startDate(),
                res.endDate(),
                ReservationStatus.APPROVED
        );

        reservations.put(res.id(), approved);
        return approved;
    }

    private boolean hasConflictWithApproved(Reservation reservation) {
        for(Reservation r : reservations.values()){
            if(r.id().equals(reservation.id())) continue;

            if(r.roomId().equals(reservation.roomId()) &&
                    r.status() == ReservationStatus.APPROVED) {

                if(reservation.startDate().isBefore(r.endDate()) &&
                        r.startDate().isBefore(reservation.endDate())) {
                    return true;
                }
            }
        }
        return false;
    }
}
