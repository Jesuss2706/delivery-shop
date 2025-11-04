package com.core.core.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStateRequest {
    
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "Pending|Processing|Shipped|Delivered|Cancelled",
             message = "Estado inválido")
    private String state;
}