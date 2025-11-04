package com.core.core.repository;

import com.core.core.modules.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

        // Consultas JPA normales - ACTUALIZADAS para el campo 'user'
        List<Cart> findByUser_Id(Long userId);

        Optional<Cart> findByUser_IdAndProCode_ProCode(Long userId, Long proCode);

        @Modifying
        @Transactional
        @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
        void deleteByUser_Id(@Param("userId") Long userId);

        // Procedimientos PL/SQL
        @Procedure(procedureName = "GESTION_CARRITO.agregar_al_carrito")
        void agregarAlCarrito(
                        @Param("p_userID") Long userID,
                        @Param("p_proCode") Long proCode,
                        @Param("p_quantity") Integer quantity);

        @Procedure(procedureName = "GESTION_CARRITO.actualizar_cantidad")
        void actualizarCantidad(
                        @Param("p_cartID") Long cartID,
                        @Param("p_quantity") Integer quantity);

        @Procedure(procedureName = "GESTION_CARRITO.eliminar_del_carrito")
        void eliminarDelCarrito(@Param("p_cartID") Long cartID);

        @Procedure(procedureName = "GESTION_CARRITO.limpiar_carrito")
        void limpiarCarrito(@Param("p_userID") Long userID);

        @Procedure(procedureName = "GESTION_CARRITO.calcular_total_carrito")
        Integer calcularTotalCarrito(@Param("p_userID") Long userID);

        @Procedure(procedureName = "GESTION_CARRITO.verificar_disponibilidad_carrito")
        Integer verificarDisponibilidadCarrito(@Param("p_userID") Long userID);
}