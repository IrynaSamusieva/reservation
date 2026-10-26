package iryna.samusieva.reservation_system.reservations;

import iryna.samusieva.reservation_system.availability.ReservationavailabilityService;
import iryna.samusieva.reservation_system.AuthenticatedUser;
import iryna.samusieva.reservation_system.login.UserRepository;
import iryna.samusieva.reservation_system.rooms.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class ReservationService {
   private final ReservationRepository repository;
   private final Logger log = LoggerFactory.getLogger(ReservationService.class);
   private final ReservationMapper mapper;
   private final ReservationavailabilityService service;
   private final RoomRepository roomRepository;
   private final UserRepository userRepository;

    public ReservationService(ReservationRepository repository,
                              ReservationMapper mapper,
                              ReservationavailabilityService service,
                              RoomRepository roomRepository,
                              UserRepository userRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.service = service;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public List<ReservationDetailDto> getMyReservationDetails(Long userId) {
        return repository.findDetails(userId);
    }

    public List<ReservationDetailDto> getAllReservationDetails() {
        return repository.findDetails(null);
    }

    public Reservation reservationToUpdate(Long id, Reservation reservationToUpdate, AuthenticatedUser user) {
        var resrvationEntity = repository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Reservation is not found"));
        if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
            throw new NoSuchElementException("Reservation is not pending");
        }
        if (!user.isAdmin() && !resrvationEntity.getUserId().equals(user.id())) {
            throw new SecurityException("You cannot update another user's reservation");
        }
        if(!reservationToUpdate.endDate().isAfter(reservationToUpdate.startDate())){
            throw new IllegalArgumentException("End date must be after start date");
        }
        var requestedRoom = roomRepository.findById(reservationToUpdate.roomId())
                .filter(room -> Boolean.TRUE.equals(room.getActive()))
                .orElseThrow(() -> new IllegalArgumentException("Room does not exist or is unavailable"));
        if (!service.isReservationAvailable(requestedRoom.getId(), reservationToUpdate.startDate(), reservationToUpdate.endDate())) {
            throw new IllegalStateException("Room is not available for the selected dates");
        }
        else{
            var updated = mapper.toReservationEntity(reservationToUpdate);
            updated.setId(id);
            updated.setUserId(resrvationEntity.getUserId());
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

    public Reservation createResevation(Reservation reservation, Long authenticatedUserId) {
        if(reservation.status() != null){
            throw new IllegalArgumentException("You cant input your own status");
        }
        if(!reservation.endDate().isAfter(reservation.startDate())){
            throw new IllegalArgumentException("End date must be after start date");
        }
        var entityToSave = mapper.toReservationEntity(reservation);
        entityToSave.setUserId(authenticatedUserId);
        entityToSave.setStatus(ReservationStatus.PENDING);

        var savedEntity = repository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Transactional
    public Reservation approveReservation(Long id) {
        var resrvationEntity = repository.findByIdForUpdate(id).orElseThrow(() ->
                new NoSuchElementException("Reservation is not found"));
        if(resrvationEntity.getStatus() != ReservationStatus.PENDING){
            throw new NoSuchElementException("Reservation is not pending");
        }

        roomRepository.findByIdForUpdate(resrvationEntity.getRoomId()).orElseThrow(() ->
                new IllegalStateException("Room does not exist or is unavailable"));

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
