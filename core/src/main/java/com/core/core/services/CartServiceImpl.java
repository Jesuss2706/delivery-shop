package com.core.core.services;

import com.core.core.modules.Cart;
import com.core.core.modules.Product;
import com.core.core.modules.User;
import com.core.core.repository.CartRepository;
import com.core.core.repository.ProductRepository;
import com.core.core.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CartServiceImpl(CartRepository cartRepository, 
                          ProductRepository productRepository,
                          UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ============= MÉTODOS JPA NORMALES =============
    
    @Override
    public List<Cart> getCartByUser(Long userId) {
        return cartRepository.findByUser_Id(userId);  
    }

    @Override
    @Transactional
    public Cart addToCart(Long userId, Long proCode, Integer quantity) {
        // Verificar que el usuario existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userId));
        
        // Verificar que el producto existe
        Product product = productRepository.findById(proCode)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + proCode));
        
        // Verificar si el producto ya está en el carrito
        Optional<Cart> existingCart = cartRepository
                .findByUser_IdAndProCode_ProCode(userId, proCode); 
        
        if (existingCart.isPresent()) {
            // Si existe, actualizar cantidad
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + quantity);
            cart.setAddedDate(new Date());
            return cartRepository.save(cart);
        } else {
            // Si no existe, crear nuevo
            Cart newCart = Cart.builder()
                    .user(user)  
                    .proCode(product)
                    .quantity(quantity)
                    .addedDate(new Date())
                    .build();
            return cartRepository.save(newCart);
        }
    }

    @Override
    @Transactional
    public Cart updateCartQuantity(Long cartID, Integer quantity) {
        Cart cart = cartRepository.findById(cartID)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado: " + cartID));
        
        cart.setQuantity(quantity);
        cart.setAddedDate(new Date());
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public boolean removeFromCart(Long cartID) {
        if (cartRepository.existsById(cartID)) {
            cartRepository.deleteById(cartID);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUser_Id(userId);  
    }

    @Override
    public BigDecimal calculateCartTotal(Long userId) {
        List<Cart> cartItems = cartRepository.findByUser_Id(userId);  
        
        return cartItems.stream()
                .map(item -> item.getProCode().getProPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ============= MÉTODOS USANDO PL/SQL =============

    @Override
    @Transactional
    public void agregarAlCarritoProcedure(Long userId, Long proCode, Integer quantity) {
        cartRepository.agregarAlCarrito(userId, proCode, quantity);
    }

    @Override
    @Transactional
    public void actualizarCantidadProcedure(Long cartID, Integer quantity) {
        cartRepository.actualizarCantidad(cartID, quantity);
    }

    @Override
    @Transactional
    public void eliminarDelCarritoProcedure(Long cartID) {
        cartRepository.eliminarDelCarrito(cartID);
    }

    @Override
    @Transactional
    public void limpiarCarritoProcedure(Long userId) {
        cartRepository.limpiarCarrito(userId);
    }

    @Override
    public BigDecimal calcularTotalCarritoProcedure(Long userId) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("PKG_CARRITO.CALCULAR_TOTAL_CARRITO")
                .registerStoredProcedureParameter("p_user", Long.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_total", BigDecimal.class, ParameterMode.OUT)
                .setParameter("p_user", userId);

        query.execute();
        
        BigDecimal total = (BigDecimal) query.getOutputParameterValue("p_total");
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public boolean verificarDisponibilidadCarritoProcedure(Long userId) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("PKG_CARRITO.VERIFICAR_DISPONIBILIDAD_CARRITO")
                .registerStoredProcedureParameter("p_user", Long.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_disponible", Integer.class, ParameterMode.OUT)
                .setParameter("p_user", userId);

        query.execute();
        
        Integer disponible = (Integer) query.getOutputParameterValue("p_disponible");
        return disponible != null && disponible == 1;
    }
}