package iryna.samusieva.reservation_system;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReservationService {
   private final ReservationRepository repository;

    public ReservationService(ReservationRepository repository) {
        this.repository = repository;
    }

    public Reservation reservationToUpdate(Long id, Reservation reservationToUpdate) {
    var resrvationEntity = repository.findById(id).orElseThrow(() ->
            new NoSuchElementException("Reservation is not found"));
    if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
        throw new NoSuchElementException("Reservation is not pending");
    }
        else{
            var updated = new ReservationEntity(
                    resrvationEntity.getId(),
                    reservationToUpdate.userId(),
                    reservationToUpdate.roomId(),
                    reservationToUpdate.startDate(),
                    reservationToUpdate.endDate(),
                    ReservationStatus.PENDING
            );
            var saved = repository.save(updated);
            return toDomainReservation(saved);
        }
    }

    public void reseravationToDelete(Long id) {
        if(!repository.existsById(id)){
            throw new NoSuchElementException("Reservation is not found");
        }
        repository.setStatus(id, ReservationStatus.REJECTED);
    }

    public Reservation getResetvationById(Long id) {
        ReservationEntity result = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reservation not found"));
        return toDomainReservation(result);
    }
    public List<Reservation> getAllReservations() {
        List<ReservationEntity> allReservations = repository.findAll();
        List<Reservation> result = allReservations.stream()
                .map(this::toDomainReservation).toList();

      return result;
    }

    public Reservation createResevation(Reservation reservation) {
        if(reservation.id() != null){
            throw new IllegalArgumentException("You cant input your own id");
        }
        if(reservation.status() != null){
            throw new IllegalArgumentException("You cant input your own status");
        }

           var entityToSave =   new ReservationEntity(
                        null,
                        reservation.userId(),
                        reservation.roomId(),
                        reservation.startDate(),
                        reservation.endDate(),
                        ReservationStatus.PENDING
                );

        var savedEntity = repository.save(entityToSave);
        return toDomainReservation(savedEntity);
    }

    public Reservation approveReservation(Long id) {
        var resrvationEntity = repository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Reservation is not found"));
        if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
            throw new NoSuchElementException("Reservation is not pending");
        }

        if(hasConflictWithApproved(resrvationEntity)){
            throw new IllegalStateException("Reservation conflicts with existing approved reservation");
        }

        resrvationEntity.setStatus(ReservationStatus.APPROVED);
       var saved = repository.save(resrvationEntity);
        return toDomainReservation(saved);
    }

    private boolean hasConflictWithApproved(ReservationEntity reservation) {
       var allReservations = repository.findAll();
       for(ReservationEntity reservationEntity : allReservations){
           if(reservationEntity.getId().equals(reservation.getId())){
               continue;
           }
           if(!reservation.getRoomId().equals(reservationEntity.getRoomId())){
               continue;
           }
           if(reservation.getStartDate().isBefore(reservationEntity.getEndDate())
           && reservationEntity.getStartDate().isBefore(reservation.getEndDate())){
               return true;
           }
       }
        return false;
    }
    private Reservation toDomainReservation(ReservationEntity reservation) {
        return new Reservation(
                reservation.getId(),
                reservation.getUserId(),
                reservation.getRoomId(),
                reservation.getStartDate(),
                reservation.getEndDate(),
                reservation.getStatus()
        );
    }
}
