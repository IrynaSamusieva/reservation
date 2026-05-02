package iryna.samusieva.reservation_system.login;


import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity toEntity(UserRequest dto);
    UserResponse toResponse(UserEntity entity);
}
