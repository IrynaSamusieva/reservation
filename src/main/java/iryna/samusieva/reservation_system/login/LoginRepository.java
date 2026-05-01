package iryna.samusieva.reservation_system.login;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginRepository extends JpaRepository<UserEntity, Long> {

}
