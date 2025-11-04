package com.core.core.controllers;

import com.core.core.dto.*;
import com.core.core.services.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Procesar compra desde el carrito
     * POST /api/checkout/process
     * 
     * Request Body:
     * {
     * "userID": 11,
     * "paymentType": "TARJETA"
     * }
     */
    @PostMapping("/process")
    public ResponseEntity<?> processCheckout(@Valid @RequestBody CheckoutRequest request) {
        try {
            log.info("Procesando checkout para usuario: {}", request.getUserID());
            CheckoutResponse response = checkoutService.procesarCompra(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al procesar checkout: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", "No se pudo procesar la compra");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Obtener historial de órdenes de un usuario
     * GET /api/checkout/orders/{userID}
     */
    @GetMapping("/orders/{userID}")
    public ResponseEntity<?> getOrderHistory(@PathVariable Long userID) {
        try {
            log.info("Obteniendo historial de órdenes para usuario: {}", userID);
            List<OrderSummaryDTO> orders = checkoutService.getOrderHistory(userID);

            if (orders.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error al obtener historial de órdenes: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Obtener detalle de una orden específica
     * GET /api/checkout/order/{ordID}
     */
    @GetMapping("/order/{ordID}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long ordID) {
        try {
            log.info("Obteniendo detalle de orden: {}", ordID);
            OrderDetailDTO detail = checkoutService.getOrderDetail(ordID);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            log.error("Error al obtener detalle de orden: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Cancelar una orden
     * POST /api/checkout/cancel/{ordID}
     * 
     * Request Body:
     * {
     * "reason": "Ya no quiero el producto"
     * }
     */
    @PostMapping("/cancel/{ordID}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long ordID,
            @Valid @RequestBody CancelOrderRequest request) {
        try {
            log.info("Cancelando orden: {} - Razón: {}", ordID, request.getReason());
            checkoutService.cancelarOrden(ordID, request.getReason());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Orden cancelada exitosamente");
            response.put("ordID", ordID.toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al cancelar orden: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Cambiar estado de una orden (solo para administradores)
     * PUT /api/checkout/order/{ordID}/status
     * 
     * Request Body:
     * {
     * "state": "Shipped"
     * }
     */
    @PutMapping("/order/{ordID}/status")
    public ResponseEntity<?> changeOrderStatus(
            @PathVariable Long ordID,
            @Valid @RequestBody UpdateOrderStateRequest request) {
        try {
            log.info("Cambiando estado de orden {} a {}", ordID, request.getState());
            checkoutService.cambiarEstadoOrden(ordID, request.getState());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Estado actualizado exitosamente");
            response.put("ordID", ordID.toString());
            response.put("newState", request.getState());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al cambiar estado de orden: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/admin/order/{ordID}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long ordID,
            @Valid @RequestBody UpdateOrderStateRequest request) {
        try {
            log.info("Actualizando estado de orden {} a {}", ordID, request.getState());
            checkoutService.updateOrderStatus(ordID, request.getState());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Estado actualizado exitosamente");
            response.put("ordID", ordID.toString());
            response.put("newState", request.getState());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al actualizar estado de orden: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/admin/orders/filtered")
    public ResponseEntity<?> getOrdersWithFilters(
            @RequestParam(required = false) String state) {
        try {
            log.info("Obteniendo órdenes con filtros - estado: {}", state);
            List<OrderSummaryDTO> orders = checkoutService.getOrdersWithFilters(state);

            if (orders.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error al obtener órdenes con filtros: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            log.info("Obteniendo todas las órdenes del sistema");
            List<OrderSummaryDTO> orders = checkoutService.getAllOrders();

            if (orders.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error al obtener todas las órdenes: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Obtener órdenes pendientes de un usuario
     * GET /api/checkout/pending/{userID}
     */
    @GetMapping("/pending/{userID}")
    public ResponseEntity<?> getPendingOrders(@PathVariable Long userID) {
        try {
            log.info("Obteniendo órdenes pendientes para usuario: {}", userID);
            List<OrderSummaryDTO> orders = checkoutService.getPendingOrders(userID);

            if (orders.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error al obtener órdenes pendientes: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Health check del servicio de checkout
     * GET /api/checkout/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Checkout Service");
        return ResponseEntity.ok(health);
    }
}