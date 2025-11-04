package com.core.core.modules;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Date;
import java.util.List;

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
    @Column(name = "ORDSTATE", length = 30, nullable = false)
    private String ordState; // Pending, Processing, Shipped, Delivered, Cancelled
    
    @NotNull(message = "La fecha de la orden es obligatoria")
    @Temporal(TemporalType.DATE)
    @Column(name = "ORDDATE", nullable = false)
    private Date ordDate;
    
    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Bill bill;
    
    @PrePersist
    protected void onCreate() {
        if (ordDate == null) {
            ordDate = new Date();
        }
        if (ordState == null) {
            ordState = "Processing";
        }
    }
}
