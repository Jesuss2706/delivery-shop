package com.core.core.repository;

import com.core.core.modules.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    List<User> findByStatus(String status);

    // Registrar usuario ya estaba
    @Procedure(procedureName = "GESTION_USUARIO.REGISTRAR_USUARIO")
    void registrarUsuario(
            @Param("p_userName") String userName,
            @Param("p_userPassword") String password,
            @Param("p_userEmail") String email,
            @Param("p_userPhone") String phone,
            @Param("p_firstName") String firstName,
            @Param("p_secondName") String secondName,
            @Param("p_firstLastName") String firstLastName,
            @Param("p_secondLastName") String secondLastName,
            @Param("p_address") String address,
            @Param("p_descAddress") String descAddress,
            @Param("p_cityID") Long cityId,
            @Param("p_depID") Long depId
    );

    // Modificar usuario
    @Procedure(procedureName = "GESTION_USUARIO.MODIFICAR_USUARIO")
    void modificarUsuario(
            @Param("p_userID") Long userId,
            @Param("p_userPhone") String phone,
            @Param("p_userEmail") String email,
            @Param("p_userPassword") String password,
            @Param("p_firstName") String firstName,
            @Param("p_secondName") String secondName,
            @Param("p_firstLastName") String firstLastName,
            @Param("p_secondLastName") String secondLastName,
            @Param("p_address") String address,
            @Param("p_descAddress") String descAddress,
            @Param("p_cityID") Long cityId,
            @Param("p_depID") Long depId
    );


}
