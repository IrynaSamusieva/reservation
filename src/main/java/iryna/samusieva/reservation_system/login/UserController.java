package iryna.samusieva.reservation_system.login;

import iryna.samusieva.reservation_system.reservations.ReservationController;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservation/register")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    private final Logger log = LoggerFactory.getLogger(ReservationController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody @Valid UserRequest request) {
        userService.registerUser(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody @Valid UserRequest request) {
        UserResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}
