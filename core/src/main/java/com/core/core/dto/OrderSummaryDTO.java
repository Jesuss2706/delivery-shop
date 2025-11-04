package com.core.core.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryDTO {
    
    private Long ordID;
    private String ordState;
    private Date ordDate;
    private BigDecimal total;
    private String paymentType;
    private Integer itemCount;
}