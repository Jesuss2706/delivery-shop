package com.core.core.modules;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailId implements Serializable {
    
    private Long order;
    private Long product;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderDetailId that = (OrderDetailId) o;
        return Objects.equals(order, that.order) && 
               Objects.equals(product, that.product);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(order, product);
    }
}