package com.core.core.repository;

import com.core.core.modules.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Crear producto (ya no enviamos proCode)
    @Procedure(procedureName = "GESTION_PRODUCTO.CREAR_PRODUCTO")
    void crearProducto(
            @Param("v_proName") String proName,
            @Param("v_proImg") String proImg,
            @Param("v_proPrice") BigDecimal proPrice,
            @Param("v_proType") Long proType,
            @Param("v_descript") String descript,
            @Param("v_proMark") String proMark,
            @Param("v_status") String status
    );

    // Modificar producto (sí requiere proCode)
    @Procedure(procedureName = "GESTION_PRODUCTO.MODIFICAR_PRODUCTO")
    void modificarProducto(
            @Param("v_proCode") Long proCode,
            @Param("v_proName") String proName,
            @Param("v_proImg") String proImg,
            @Param("v_proPrice") BigDecimal proPrice,
            @Param("v_proType") Long proType,
            @Param("v_descript") String descript,
            @Param("v_proMark") String proMark,
            @Param("v_status") String status
    );

    // Eliminar producto (borrado lógico)
    @Procedure(procedureName = "GESTION_PRODUCTO.ELIMINAR_PRODUCTO")
    void eliminarProducto(@Param("v_proCode") Long proCode);


    @Query("SELECT p FROM Product p WHERE LOWER(p.proName) LIKE LOWER(CONCAT(:text, '%'))")
    List<Product> searchByName(@Param("text") String text);

}
