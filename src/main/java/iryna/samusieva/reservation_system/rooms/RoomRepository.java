package iryna.samusieva.reservation_system.rooms;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<RoomEntity, Long> {
    List<RoomEntity> findAllByActiveTrueOrderByRoomNumberAsc();
}
