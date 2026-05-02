package iryna.samusieva.reservation_system.login;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPassword(String password);

    Optional<UserEntity> findByUsername(String username);
}
