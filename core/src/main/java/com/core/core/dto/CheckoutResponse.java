package com.core.core.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {
    
    private Long ordID;
    private String ordState;
    private Date ordDate;
    private BigDecimal totalBill;
    private String paymentType;
    private String message;
    private Long billCode;
}