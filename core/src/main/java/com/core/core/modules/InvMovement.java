package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "INVMOVEMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvMovement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INVMOVID", nullable = false)
    private Long invMovID;
    
    @NotNull(message = "El inventario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVCODE", nullable = false)
    private InventoryClass inventory;
    
    @NotBlank(message = "El tipo de movimiento es obligatorio")
    @Pattern(regexp = "ENTRADA|SALIDA|DEVOLUCION|AJUSTE",
             message = "El tipo debe ser ENTRADA, SALIDA, DEVOLUCION o AJUSTE")
    @Column(name = "MOVTYPE", length = 20, nullable = false)
    private String movType;
    
    @NotNull(message = "La fecha del movimiento es obligatoria")
    @Temporal(TemporalType.DATE)
    @Column(name = "MOVDATE", nullable = false)
    private Date movDate;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;
    
    @Column(name = "PREVSTOCK")
    private Integer prevStock;
    
    @Column(name = "NEWSTOCK")
    private Integer newStock;
    
    @Column(name = "REASON", length = 200)
    private String reason;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDID")
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID")
    private User user;
    
    @PrePersist
    protected void onCreate() {
        if (movDate == null) {
            movDate = new Date();
        }
    }
}