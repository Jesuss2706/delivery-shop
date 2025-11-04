package com.core.core.repository;

import com.core.core.modules.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Métodos que faltan
    List<Order> findByUserId(Long userId);
    List<Order> findByUser_Username(String username);
    
    // Métodos existentes que mantienes
    @Query("SELECT o FROM Order o WHERE o.user.id = :userID ORDER BY o.ordDate DESC")
    List<Order> findByUserIdOrderByOrdDateDesc(@Param("userID") Long userID);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userID AND o.ordState = :state ORDER BY o.ordDate DESC")
    List<Order> findByUserIdAndState(@Param("userID") Long userID, @Param("state") String state);
    
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.ordID = :ordID")
    Optional<Order> findByIdWithDetails(@Param("ordID") Long ordID);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.ordState = :state")
    Long countByState(@Param("state") String state);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userID AND o.ordState IN ('Pending', 'Processing')")
    List<Order> findPendingOrdersByUser(@Param("userID") Long userID);
    
    @Query("SELECT o FROM Order o ORDER BY o.ordDate DESC")
    List<Order> findAllOrderByOrdDateDesc();
    
    @Query("SELECT o FROM Order o WHERE o.ordState = :state ORDER BY o.ordDate DESC")
    List<Order> findByOrdStateOrderByOrdDateDesc(@Param("state") String state);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(:state IS NULL OR o.ordState = :state) " +
           "ORDER BY o.ordDate DESC")
    List<Order> findOrdersWithFilters(@Param("state") String state);
}