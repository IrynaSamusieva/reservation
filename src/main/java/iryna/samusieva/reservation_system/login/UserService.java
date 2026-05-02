package iryna.samusieva.reservation_system.login;

import iryna.samusieva.reservation_system.reservations.ReservationRole;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(UserRequest registrationDto) {

        if (userRepository.existsByUsername(registrationDto.username()) ||
              userRepository.existsByEmail(registrationDto.email())) {
            throw new RuntimeException("User already exists");
        }

        UserEntity userEntity = userMapper.toEntity(registrationDto);
        String encodedPassword = passwordEncoder.encode(registrationDto.password());
        userEntity.setPassword(encodedPassword);
        userEntity.setRole(ReservationRole.USER);
        userRepository.save(userEntity);
    }

    public UserResponse loginUser(UserRequest user) {
        UserEntity userEntity = userRepository.findByUsername(user.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!passwordEncoder.matches(user.password(), userEntity.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }
        return userMapper.toResponse(userEntity);
    }
}
