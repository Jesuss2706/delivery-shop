package com.core.core.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvMovementDTO {
    // Datos de InvMovement
    private Long invMovID;
    private String movType;
    private Date movDate;
    private Integer quantity;
    private Integer prevStock;
    private Integer newStock;
    private String reason;
    
    // Datos de Inventory
    private Long invCode;
    private Integer invStock;
    private BigDecimal sellingPrice;
    private LocalDate invDate;
    private String status;
    
    // Datos de Product
    private Long proCode;
    private String proName;
    private String proImg;
    
    // Datos de Provider
    private Long provId;
    private String provName;
    
    // Datos de Order
    private Long ordId;
    
    // Datos de User
    private Long userId;
    private String userName;
}