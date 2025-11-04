package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "ORDER_DETAIL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(OrderDetailId.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OrderDetail {
    
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDID", nullable = false)
    private Order order;
    
    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PROCODE", nullable = false)
    private Product product;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;
    
    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(name = "UNITPRICE", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;
    
    @Transient
    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}