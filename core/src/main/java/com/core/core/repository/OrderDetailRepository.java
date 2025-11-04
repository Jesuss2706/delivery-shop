package com.core.core.repository;

import com.core.core.modules.OrderDetail;
import com.core.core.modules.OrderDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, OrderDetailId> {
    
    // Buscar detalles por ID de orden
    @Query("SELECT od FROM OrderDetail od " +
           "LEFT JOIN FETCH od.product " +
           "WHERE od.order.ordID = :ordID")
    List<OrderDetail> findByOrderId(@Param("ordID") Long ordID);
    
    // Buscar productos más vendidos
    @Query("SELECT od.product.proCode, od.product.proName, SUM(od.quantity) as total " +
           "FROM OrderDetail od " +
           "GROUP BY od.product.proCode, od.product.proName " +
           "ORDER BY total DESC")
    List<Object[]> findMostSoldProducts();
}