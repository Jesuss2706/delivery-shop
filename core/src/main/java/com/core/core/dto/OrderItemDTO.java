package com.core.core.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    
    private Long proCode;
    private String proName;
    private String proImg;
    private String proMark;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}