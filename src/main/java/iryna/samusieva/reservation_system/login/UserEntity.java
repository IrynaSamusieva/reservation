package iryna.samusieva.reservation_system.login;

import iryna.samusieva.reservation_system.reservations.ReservationRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;

import java.time.LocalDate;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    Long id;
    @Column(name = "username")
    String username;
    @Column(name = "email")
    String email;
    @Column(name = "password")
    String password;
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    ReservationRole role;
    @Column(name = "created_at")
    LocalDate createdAt;

    public UserEntity(@Null Long id,
                      @NotNull String usernamme,
                      @NotNull String email,
                      @NotNull String password,
                      @NotNull ReservationRole role,
                      @NotNull LocalDate localDate) {
        this.id = id;
        this.username = usernamme;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = localDate;
    }

    public UserEntity() {

    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public ReservationRole getRole() {
        return role;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

}
