package com.core.core.repository;

import com.core.core.modules.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    // Buscar factura por ID de orden
    @Query("SELECT b FROM Bill b WHERE b.order.ordID = :ordID")
    Optional<Bill> findByOrderId(@Param("ordID") Long ordID);
    
    // Buscar facturas de un usuario
    @Query("SELECT b FROM Bill b WHERE b.order.user.id = :userID ORDER BY b.billDate DESC")
    List<Bill> findByUserId(@Param("userID") Long userID);
    
    // Buscar facturas por rango de fechas
    @Query("SELECT b FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    List<Bill> findByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    // Calcular total de ventas por tipo de pago
    @Query("SELECT b.paymentType, SUM(b.totalBill) FROM Bill b GROUP BY b.paymentType")
    List<Object[]> getTotalsByPaymentType();
    
}