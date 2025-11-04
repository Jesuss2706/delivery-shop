package com.core.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelOrderRequest {
    
    @NotBlank(message = "La razón de cancelación es obligatoria")
    private String reason;
}