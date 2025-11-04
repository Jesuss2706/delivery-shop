package com.core.core.services;

import com.core.core.modules.Cart;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CartService {
    
    // Métodos JPA normales
    List<Cart> getCartByUser(Long userId);
    Cart addToCart(Long userId, Long proCode, Integer quantity);
    Cart updateCartQuantity(Long cartID, Integer quantity);
    boolean removeFromCart(Long cartID);
    void clearCart(Long userId);
    BigDecimal calculateCartTotal(Long userId);
    
    // Métodos PL/SQL
    void agregarAlCarritoProcedure(Long userId, Long proCode, Integer quantity);
    void actualizarCantidadProcedure(Long cartID, Integer quantity);
    void eliminarDelCarritoProcedure(Long cartID);
    void limpiarCarritoProcedure(Long userId);
    BigDecimal calcularTotalCarritoProcedure(Long userId);
    boolean verificarDisponibilidadCarritoProcedure(Long userId);
    
   
    Map<String, Object> verificarDisponibilidadCarritoCompleto(Long userId);
}