package iryna.samusieva.reservation_system.rooms;

import iryna.samusieva.reservation_system.reservations.ReservationEntity;
import iryna.samusieva.reservation_system.reservations.ReservationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    public RoomController(RoomRepository roomRepository, ReservationRepository reservationRepository) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllActiveRooms() {
        List<RoomResponse> rooms = roomRepository.findAllByActiveTrueOrderByRoomNumberAsc()
                .stream()
                .map(RoomResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> rooms = roomRepository.findAll()
                .stream()
                .map(RoomResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable("id") Long id) {
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + id));
        return ResponseEntity.ok(RoomResponse.fromEntity(room));
    }

    @GetMapping("/{id}/booked-dates")
    public ResponseEntity<List<RoomBookedDatesDto>> getRoomBookedDates(@PathVariable("id") Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + id);
        }

        List<ReservationEntity> reservations = reservationRepository.findActiveReservationsByRoomId(id);
        List<RoomBookedDatesDto> bookedDates = reservations.stream()
                .map(r -> new RoomBookedDatesDto(r.getStartDate(), r.getEndDate(), r.getStatus()))
                .toList();

        return ResponseEntity.ok(bookedDates);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody @Valid RoomRequest request) {
        RoomEntity room = new RoomEntity();
        room.setRoomNumber(request.roomNumber());
        room.setName(request.name());
        room.setDescription(request.description());
        room.setCapacity(request.capacity());
        room.setPricePerNight(request.pricePerNight());
        room.setImageUrl(request.imageUrl());
        room.setActive(true);
        RoomEntity saved = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(RoomResponse.fromEntity(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable("id") Long id,
                                                   @RequestBody @Valid RoomRequest request) {
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + id));
        room.setRoomNumber(request.roomNumber());
        room.setName(request.name());
        room.setDescription(request.description());
        room.setCapacity(request.capacity());
        room.setPricePerNight(request.pricePerNight());
        room.setImageUrl(request.imageUrl());
        RoomEntity saved = roomRepository.save(room);
        return ResponseEntity.ok(RoomResponse.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable("id") Long id) {
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + id));
        room.setActive(false);
        roomRepository.save(room);
        return ResponseEntity.noContent().build();
    }
}
