package com.core.core.controllers;

import com.core.core.dto.CartItemDTO;
import com.core.core.modules.Cart;
import com.core.core.services.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    @Lazy
    private CartService cartService;

    // ============= ENDPOINTS JPA NORMALES =============

    @GetMapping("/user/{userID}")
public ResponseEntity<?> getCartByUser(@PathVariable Long userID) {
    try {
        List<Cart> cartItems = cartService.getCartByUser(userID);
        
        BigDecimal total = cartService.calculateCartTotal(userID);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", cartItems != null ? cartItems : new ArrayList<>());
        response.put("total", total != null ? total : BigDecimal.ZERO);
        response.put("itemCount", cartItems != null ? cartItems.size() : 0);
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("items", new ArrayList<>());
        errorResponse.put("total", BigDecimal.ZERO);
        errorResponse.put("itemCount", 0);
        errorResponse.put("error", "Error al obtener el carrito: " + e.getMessage());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }
}

    @PostMapping
    public ResponseEntity<?> addToCart(@Valid @RequestBody CartItemDTO cartItemDTO, 
                                       BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors().stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        try {
            Cart cart = cartService.addToCart(
                    cartItemDTO.getUserID(), 
                    cartItemDTO.getProCode(), 
                    cartItemDTO.getQuantity()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al agregar al carrito: " + e.getMessage());
        }
    }

    @PutMapping("/{cartID}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable Long cartID, 
                                                @RequestParam Integer quantity) {
        if (quantity <= 0) {
            return ResponseEntity.badRequest()
                    .body("La cantidad debe ser mayor a 0");
        }

        try {
            Cart cart = cartService.updateCartQuantity(cartID, quantity);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar cantidad: " + e.getMessage());
        }
    }

    @DeleteMapping("/{cartID}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartID) {
        try {
            boolean deleted = cartService.removeFromCart(cartID);
            
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró el item en el carrito con ID: " + cartID);
            }
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar del carrito: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/{userID}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userID) {
        try {
            cartService.clearCart(userID);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al limpiar el carrito: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userID}/total")
    public ResponseEntity<?> getCartTotal(@PathVariable Long userID) {
        try {
            BigDecimal total = cartService.calculateCartTotal(userID);
            Map<String, BigDecimal> response = new HashMap<>();
            response.put("total", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al calcular total: " + e.getMessage());
        }
    }

    // ============= ENDPOINTS CON PL/SQL =============

    @PostMapping("/plsql")
    public ResponseEntity<?> addToCartPLSQL(@Valid @RequestBody CartItemDTO cartItemDTO, 
                                            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors().stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        try {
            cartService.agregarAlCarritoProcedure(
                    cartItemDTO.getUserID(), 
                    cartItemDTO.getProCode(), 
                    cartItemDTO.getQuantity()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Producto agregado al carrito exitosamente (PL/SQL)");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al agregar al carrito (PL/SQL): " + e.getMessage());
        }
    }

    @PutMapping("/plsql/{cartID}")
    public ResponseEntity<?> updateCartQuantityPLSQL(@PathVariable Long cartID, 
                                                     @RequestParam Integer quantity) {
        if (quantity <= 0) {
            return ResponseEntity.badRequest()
                    .body("La cantidad debe ser mayor a 0");
        }

        try {
            cartService.actualizarCantidadProcedure(cartID, quantity);
            return ResponseEntity.ok("Cantidad actualizada correctamente (PL/SQL)");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar cantidad (PL/SQL): " + e.getMessage());
        }
    }

    @DeleteMapping("/plsql/{cartID}")
    public ResponseEntity<?> removeFromCartPLSQL(@PathVariable Long cartID) {
        try {
            cartService.eliminarDelCarritoProcedure(cartID);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar del carrito (PL/SQL): " + e.getMessage());
        }
    }

    @DeleteMapping("/plsql/user/{userID}/clear")
    public ResponseEntity<?> clearCartPLSQL(@PathVariable Long userID) {
        try {
            cartService.limpiarCarritoProcedure(userID);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al limpiar el carrito (PL/SQL): " + e.getMessage());
        }
    }

    @GetMapping("/plsql/user/{userID}/total")
    public ResponseEntity<?> getCartTotalPLSQL(@PathVariable Long userID) {
        try {
            BigDecimal total = cartService.calcularTotalCarritoProcedure(userID);
            Map<String, BigDecimal> response = new HashMap<>();
            response.put("total", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al calcular total (PL/SQL): " + e.getMessage());
        }
    }

    @GetMapping("/plsql/user/{userID}/check-availability")
    public ResponseEntity<?> checkCartAvailabilityPLSQL(@PathVariable Long userID) {
        try {
            boolean disponible = cartService.verificarDisponibilidadCarritoProcedure(userID);
            Map<String, Object> response = new HashMap<>();
            response.put("available", disponible);
            response.put("message", disponible ? 
                "Todos los productos tienen stock disponible" : 
                "Uno o más productos no tienen stock suficiente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al verificar disponibilidad (PL/SQL): " + e.getMessage());
        }
    }
}