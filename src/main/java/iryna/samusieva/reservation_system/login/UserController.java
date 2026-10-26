package iryna.samusieva.reservation_system.login;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;
    @Value("${app.jwt.expiration-minutes:60}")
    private long tokenExpirationMinutes;
    private final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody @Valid UserRequest request) {
        userService.registerUser(request);
        log.info("User registered successfully");
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody @Valid UserRequest request) {
        UserResponse response = userService.loginUser(request);
        log.info("User login successfully");
        ResponseCookie cookie = ResponseCookie.from("access_token", userService.createLoginToken(request.email()))
                .httpOnly(true).secure(secureCookie).sameSite("Lax").path("/")
                .maxAge(java.time.Duration.ofMinutes(tokenExpirationMinutes)).build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("access_token", "").httpOnly(true)
                .secure(secureCookie).sameSite("Lax").path("/").maxAge(0).build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }
}
