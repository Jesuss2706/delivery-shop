package com.core.core.controllers;

import com.core.core.modules.Order;
import com.core.core.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    @Lazy
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        if(orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{codeId}")
    public ResponseEntity<?> getOrder(@PathVariable Long codeId) {
        Order order = orderService.getOrder(codeId);
        if(order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro la orden con el codigo: "+ codeId);
        }
        return ResponseEntity.ok(order);
    }

    @GetMapping("/usID/{Id}")
    public ResponseEntity<?> getOrderByUserId(@PathVariable Long Id) {
        List<Order> orders = orderService.getOrdersByUserId(Id);
        if(orders.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontraron ordenes con el id: "+ Id);
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getOrderByUsername(@PathVariable String username) {
        List<Order> orders = orderService.getOrdersByUsername(username);
        if(orders.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontraron ordenes para el usuario: "+ username);
        }
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order, BindingResult result) {
        if(result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors().stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        Order newOrder = orderService.createOrder(order);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{code}")
                .buildAndExpand(newOrder.getOrdID())
                .toUri();

        return ResponseEntity.created(location).build();
    }


    @PutMapping("/{code}")
    public ResponseEntity<?> updateOrder(@PathVariable Long code,@Valid @RequestBody Order order, BindingResult result) {
        if(result.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    result.getFieldErrors()
                            .stream()
                            .map(error -> "El campo '" + error.getField() + "' " + error.getDefaultMessage())
                            .toList()
            );
        }

        Order updOrder = orderService.updateOrder(code, order);
        if(updOrder == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro la orden con el codigo: "+ code);
        }
        return ResponseEntity.ok(updOrder);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long code) {
        boolean deleted = orderService.deleteOrder(code);

        if(!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontro la orden con el codigo: "+ code);
        }
        return ResponseEntity.noContent().build();
    }
}
