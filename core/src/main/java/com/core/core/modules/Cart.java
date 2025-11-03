package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "CART")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CARTID", nullable = false)
    private Long cartID;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;

    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PROCODE", nullable = false)
    private Product proCode;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ADDEDDATE", nullable = false)
    private Date addedDate = new Date();
}
