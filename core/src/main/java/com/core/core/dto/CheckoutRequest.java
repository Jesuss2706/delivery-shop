package com.core.core.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
    
    @NotNull(message = "El ID del usuario es obligatorio")
    private Long userID;
    
    @NotBlank(message = "El tipo de pago es obligatorio")
    @Pattern(regexp = "EFECTIVO|TARJETA|TRANSFERENCIA",
             message = "El tipo de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA")
    private String paymentType;
}