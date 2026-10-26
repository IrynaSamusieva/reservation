package iryna.samusieva.reservation_system.reservations;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {

    @Transactional
    @Modifying
    @Query("update ReservationEntity r set r.status =:status where r.id = :id")
    void setStatus(
            @Param("id") Long id,
            @Param("status") ReservationStatus status
    );

    @Query("""
select r.id from ReservationEntity r where r.status = :status 
AND :startDate < r.endDate
AND :endDate > r.startDate
AND r.roomId = :roomId
""")
    List<Long> findConflictingReservationIds(@Param("roomId") Long roomId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             @Param("status") ReservationStatus status);

    @Query("""
    select r from ReservationEntity r where 
    (:roomId IS NULL OR r.roomId = :roomId)
    AND (:userId IS NULL OR r.userId = :userId)
""")
    List<ReservationEntity> searchByFilter(
            @Param("userId") Long userId,
            @Param("roomId") Long roomId,
            Pageable pageable
    );

    @Query("""
    select r from ReservationEntity r where 
    r.roomId = :roomId
    AND r.status IN (iryna.samusieva.reservation_system.reservations.ReservationStatus.PENDING, iryna.samusieva.reservation_system.reservations.ReservationStatus.APPROVED)
    order by r.startDate asc
""")
    List<ReservationEntity> findActiveReservationsByRoomId(@Param("roomId") Long roomId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from ReservationEntity r where r.id = :id")
    java.util.Optional<ReservationEntity> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        select new iryna.samusieva.reservation_system.reservations.ReservationDetailDto(
            r.id, r.userId, u.username, r.roomId, room.name, room.roomNumber,
            r.startDate, r.endDate, r.status)
        from ReservationEntity r
        left join iryna.samusieva.reservation_system.login.UserEntity u on u.id = r.userId
        left join iryna.samusieva.reservation_system.rooms.RoomEntity room on room.id = r.roomId
        where (:userId is null or r.userId = :userId)
    """)
    List<ReservationDetailDto> findDetails(@Param("userId") Long userId);
}
