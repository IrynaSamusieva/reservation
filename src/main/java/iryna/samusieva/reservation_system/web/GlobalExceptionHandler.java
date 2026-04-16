package iryna.samusieva.reservation_system.web;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {
    private final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex){
        log.error(ex.getMessage());
        var error = new ErrorResponseDto("Iternal server error",
                ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(500).body(error);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFoud(Exception e){
        log.error("Not found exception " + e.getMessage());
        var error = new ErrorResponseDto("Not found",
                e.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler({IllegalArgumentException.class,
            IllegalStateException.class,
    MethodArgumentNotValidException.class})
    public ResponseEntity<ErrorResponseDto> handleBadRequest(Exception e){
        log.error("Bad request" + e.getMessage());
        var error = new ErrorResponseDto("Bad request",
                e.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
