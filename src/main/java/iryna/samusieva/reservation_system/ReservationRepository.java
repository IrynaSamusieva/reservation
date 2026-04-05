package iryna.samusieva.reservation_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {


    @Transactional
    @Modifying
    @Query("update ReservationEntity r set r.status =:status where r.id = :id")
    void setStatus(
            @Param("id") Long id,
            @Param("status") ReservationStatus status
    );
}
