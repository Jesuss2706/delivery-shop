package com.core.core.services;

import com.core.core.modules.Cart;
import java.math.BigDecimal;
import java.util.List;

public interface CartService {
    // Métodos JPA normales
    List<Cart> getCartByUser(Long user);
    Cart addToCart(Long user, Long proCode, Integer quantity);
    Cart updateCartQuantity(Long cartID, Integer quantity);
    boolean removeFromCart(Long cartID);
    void clearCart(Long user);
    BigDecimal calculateCartTotal(Long user);
    
    // Métodos usando PL/SQL
    void agregarAlCarritoProcedure(Long user, Long proCode, Integer quantity);
    void actualizarCantidadProcedure(Long cartID, Integer quantity);
    void eliminarDelCarritoProcedure(Long cartID);
    void limpiarCarritoProcedure(Long user);
    BigDecimal calcularTotalCarritoProcedure(Long user);
    boolean verificarDisponibilidadCarritoProcedure(Long user);
}