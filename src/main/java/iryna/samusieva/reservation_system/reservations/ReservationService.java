package iryna.samusieva.reservation_system.reservations;

import iryna.samusieva.reservation_system.availability.ReservationavailabilityService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ReservationService {
   private final ReservationRepository repository;
   private final Logger log = LoggerFactory.getLogger(ReservationService.class);
   private final ReservationMapper mapper;
   private final ReservationavailabilityService service;

    public ReservationService(ReservationRepository repository,
                              ReservationMapper mapper,
                              ReservationavailabilityService service) {
        this.repository = repository;
        this.mapper = mapper;
        this.service = service;
    }

    public Reservation reservationToUpdate(Long id, Reservation reservationToUpdate) {
    var resrvationEntity = repository.findById(id).orElseThrow(() ->
            new NoSuchElementException("Reservation is not found"));
    if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
        throw new NoSuchElementException("Reservation is not pending");
    }
        if(!reservationToUpdate.endDate().isAfter(reservationToUpdate.startDate())){
            throw new IllegalArgumentException("End date must be after start date");
        }
        else{
            var updated = mapper.toReservationEntity(reservationToUpdate);
            updated.setId(reservationToUpdate.id());
            updated.setStatus(ReservationStatus.PENDING);
            var saved = repository.save(updated);
            return mapper.toDomain(saved);
        }
    }


    public void reseravationToDelete(Long id) {
        var reservation = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reservation is not found"));
        if(reservation.getStatus().equals(ReservationStatus.REJECTED)){
            throw new IllegalStateException("Reservation is already rejected");
        }
        repository.setStatus(id, ReservationStatus.REJECTED);
    }

    public Reservation getResetvationById(Long id) {
        ReservationEntity result = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reservation not found"));
        return mapper.toDomain(result);
    }
    public List<Reservation> searchByFilter(ReservationSearchFilter filter) {
        int pageSize = filter.pageSize() != null ? filter.pageSize() : 10;
        int pageNumber = filter.pageNumber() != null ? filter.pageNumber() : 0;
        var pageable = Pageable.ofSize(pageSize).withPage(pageNumber);
        List<ReservationEntity> allEntity = repository.searchByFilter(filter.userId(),
                filter.roomId(),
                pageable);
        return allEntity.stream().map(mapper::toDomain).toList();
    }

    public Reservation createResevation(Reservation reservation) {
        if(reservation.status() != null){
            throw new IllegalArgumentException("You cant input your own status");
        }
        if(!reservation.endDate().isAfter(reservation.startDate())){
            throw new IllegalArgumentException("End date must be after start date");
        }
           var entityToSave = mapper.toReservationEntity(reservation);
        entityToSave.setStatus(ReservationStatus.PENDING);

        var savedEntity = repository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    public Reservation approveReservation(Long id) {
        var resrvationEntity = repository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Reservation is not found"));
        if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
            throw new NoSuchElementException("Reservation is not pending");
        }

        if(!service.isReservationAvailable(resrvationEntity.getRoomId(),
                resrvationEntity.getStartDate(),
                resrvationEntity.getEndDate())){
            throw new IllegalStateException("Reservation conflicts with existing approved reservation");
        }

        resrvationEntity.setStatus(ReservationStatus.APPROVED);
       var saved = repository.save(resrvationEntity);
        return mapper.toDomain(saved);
    }



}
