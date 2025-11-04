package com.core.core.repository;

import com.core.core.modules.InvMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface InvMovementRepository extends JpaRepository<InvMovement, Long> {
    
    // Buscar movimientos por código de inventario
    @Query("SELECT im FROM InvMovement im WHERE im.inventory.invCode = :invCode ORDER BY im.movDate DESC")
    List<InvMovement> findByInventoryCode(@Param("invCode") Long invCode);
    
    // Buscar movimientos por tipo
    @Query("SELECT im FROM InvMovement im WHERE im.movType = :movType ORDER BY im.movDate DESC")
    List<InvMovement> findByMovType(@Param("movType") String movType);
    
    // Buscar movimientos por orden
    @Query("SELECT im FROM InvMovement im WHERE im.order.ordID = :ordID")
    List<InvMovement> findByOrderId(@Param("ordID") Long ordID);
    
    // Buscar movimientos por rango de fechas
    @Query("SELECT im FROM InvMovement im WHERE im.movDate BETWEEN :startDate AND :endDate ORDER BY im.movDate DESC")
    List<InvMovement> findByDateRange(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
}