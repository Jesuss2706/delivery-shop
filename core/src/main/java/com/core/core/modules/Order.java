package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "\"ORDER\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDID", nullable = false)
    private Long ordID;

    @NotBlank(message = "El estado de la orden es obligatorio")
    @Size(max = 30, message = "El estado no puede tener más de 30 caracteres")
    @Pattern(
            regexp = "Pending|Processing|Shipped|Delivered|Cancelled",
            message = "El estado debe ser uno de los siguientes: Pending, Processing, Shipped, Delivered o Cancelled"
    )
    @Column(name = "ORDSTATE", nullable = false, length = 30)
    private String ordState;

    @NotNull(message = "La fecha de la orden es obligatoria")
    @Temporal(TemporalType.DATE)
    @Column(name = "ORDDATE", nullable = false)
    private Date ordDate = new Date();

    @NotNull(message = "La orden debe estar asociada a un usuario")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;
}
