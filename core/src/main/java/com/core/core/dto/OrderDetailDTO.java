package com.core.core.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDTO {
    
    private Long ordID;
    private String ordState;
    private Date ordDate;
    private BigDecimal total;
    private String paymentType;
    private Long billCode;
    private List<OrderItemDTO> items;
    private UserInfoDTO user;
}