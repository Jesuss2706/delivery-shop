package com.core.core.controllers;

import com.core.core.dto.InvMovementDTO;
import com.core.core.services.InvMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/inv-movements")
@CrossOrigin(origins = "*") 
public class InvMovementController {

    @Autowired
    @Lazy
    private InvMovementService invMovementService;

    // ============ ENDPOINTS PL/SQL ============
    
    @GetMapping("/plsql")
    public ResponseEntity<List<InvMovementDTO>> getAllMovementsPLSQL() {
        List<InvMovementDTO> list = invMovementService.findAllDTO();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/plsql/{id}")
    public ResponseEntity<?> getMovementByIdPLSQL(@PathVariable Long id) {
        Optional<InvMovementDTO> movement = invMovementService.findByIdDTO(id);
        if (movement.isPresent()) {
            return ResponseEntity.ok(movement.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró el movimiento con el ID: " + id);
        }
    }

    @GetMapping("/plsql/active")
    public ResponseEntity<List<InvMovementDTO>> getActiveMovementsPLSQL() {
        List<InvMovementDTO> list = invMovementService.findAllDTO();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/plsql/inventory/{invCode}")
    public ResponseEntity<?> getMovementsByInventoryPLSQL(@PathVariable Long invCode) {
        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeDTO(invCode);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/plsql/type/{movType}")
    public ResponseEntity<?> getMovementsByTypePLSQL(@PathVariable String movType) {
        List<InvMovementDTO> movements = invMovementService.findByMovTypeDTO(movType);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/plsql/order/{ordID}")
    public ResponseEntity<?> getMovementsByOrderPLSQL(@PathVariable Long ordID) {
        List<InvMovementDTO> movements = invMovementService.findByOrderIdDTO(ordID);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/plsql/date-range")
    public ResponseEntity<?> getMovementsByDateRangePLSQL(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        if (startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body("Las fechas de inicio y fin son requeridas");
        }

        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest()
                    .body("La fecha de inicio no puede ser posterior a la fecha fin");
        }

        List<InvMovementDTO> movements = invMovementService.findByDateRangeDTO(startDate, endDate);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/plsql/inventory/{invCode}/type/{movType}")
    public ResponseEntity<?> getMovementsByInventoryAndTypePLSQL(
            @PathVariable Long invCode,
            @PathVariable String movType) {
        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeAndMovTypeDTO(invCode, movType);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/plsql/inventory/{invCode}/date-range")
    public ResponseEntity<?> getMovementsByInventoryAndDateRangePLSQL(
            @PathVariable Long invCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        if (startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body("Las fechas de inicio y fin son requeridas");
        }

        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest()
                    .body("La fecha de inicio no puede ser posterior a la fecha fin");
        }

        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeAndDateRangeDTO(invCode, startDate, endDate);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    // ============ ENDPOINTS JPA ============

    @GetMapping
    public ResponseEntity<List<InvMovementDTO>> getAllInvMovements() {
        List<InvMovementDTO> list = invMovementService.findAllDTO();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvMovementById(@PathVariable Long id) {
        Optional<InvMovementDTO> movement = invMovementService.findByIdDTO(id);
        if (movement.isPresent()) {
            return ResponseEntity.ok(movement.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró el movimiento con el ID: " + id);
        }
    }

    @GetMapping("/inventory/{invCode}")
    public ResponseEntity<?> getMovementsByInventoryCode(@PathVariable Long invCode) {
        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeDTO(invCode);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/type/{movType}")
    public ResponseEntity<?> getMovementsByType(@PathVariable String movType) {
        List<InvMovementDTO> movements = invMovementService.findByMovTypeDTO(movType);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/order/{ordID}")
    public ResponseEntity<?> getMovementsByOrderId(@PathVariable Long ordID) {
        List<InvMovementDTO> movements = invMovementService.findByOrderIdDTO(ordID);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/date-range")
    public ResponseEntity<?> getMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        if (startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body("Las fechas de inicio y fin son requeridas");
        }

        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest()
                    .body("La fecha de inicio no puede ser posterior a la fecha fin");
        }

        List<InvMovementDTO> movements = invMovementService.findByDateRangeDTO(startDate, endDate);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/inventory/{invCode}/type/{movType}")
    public ResponseEntity<?> getMovementsByInventoryAndType(
            @PathVariable Long invCode,
            @PathVariable String movType) {
        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeAndMovTypeDTO(invCode, movType);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/inventory/{invCode}/date-range")
    public ResponseEntity<?> getMovementsByInventoryAndDateRange(
            @PathVariable Long invCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {

        if (startDate == null || endDate == null) {
            return ResponseEntity.badRequest()
                    .body("Las fechas de inicio y fin son requeridas");
        }

        if (startDate.after(endDate)) {
            return ResponseEntity.badRequest()
                    .body("La fecha de inicio no puede ser posterior a la fecha fin");
        }

        List<InvMovementDTO> movements = invMovementService.findByInventoryCodeAndDateRangeDTO(invCode, startDate, endDate);
        if (movements.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countMovements() {
        long count = invMovementService.count();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> existsById(@PathVariable Long id) {
        boolean exists = invMovementService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}