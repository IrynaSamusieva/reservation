package iryna.samusieva.reservation_system.rooms;

import iryna.samusieva.reservation_system.reservations.ReservationEntity;
import iryna.samusieva.reservation_system.reservations.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}
