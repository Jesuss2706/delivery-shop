package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "BILL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BILLCODE", nullable = false)
    private Long billCode;
    
    @NotNull(message = "El inventario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVCODE", nullable = false)
    private InventoryClass inventory;
    
    @NotNull(message = "La orden es obligatoria")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDID", nullable = false, unique = true)
    private Order order;
    
    @NotBlank(message = "El tipo de pago es obligatorio")
    @Pattern(regexp = "EFECTIVO|TARJETA|TRANSFERENCIA", 
             message = "El tipo de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA")
    @Column(name = "PAYMENTTYPE", length = 40, nullable = false)
    private String paymentType;
    
    @NotNull(message = "La fecha de la factura es obligatoria")
    @Temporal(TemporalType.DATE)
    @Column(name = "BILLDATE", nullable = false)
    private Date billDate;
    
    @NotNull(message = "El total es obligatorio")
    @DecimalMin(value = "0.01", message = "El total debe ser mayor a 0")
    @Column(name = "TOTALBILL", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalBill;
    
    @PrePersist
    protected void onCreate() {
        if (billDate == null) {
            billDate = new Date();
        }
    }
}