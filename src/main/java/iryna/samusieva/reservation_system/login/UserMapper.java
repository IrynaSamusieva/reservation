package iryna.samusieva.reservation_system.login;

public class UserMapper {
    public User toUser(UserEntity user) {
        return new User(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public UserEntity toUserEntity(User user) {
        return new UserEntity(
                user.id(),
                user.usernamme(),
                user.email(),
                user.password(),
                user.role(),
                user.loginTime()
        );
    }
}
