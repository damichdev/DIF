package com.dif.citasservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "signos_vitales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignosVitales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_signos")
    private Long idSignos;

    @Column(precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(precision = 5, scale = 2)
    private BigDecimal talla;

    @Column(precision = 4, scale = 1)
    private BigDecimal temperatura;

    @Column(name = "spo2")
    private Integer spo2;

    @Column(name = "fc")
    private Integer fc;

    @Column(name = "fr")
    private Integer fr;

    @Column(name = "ta", length = 20)
    private String ta;

    @Column(precision = 5, scale = 2)
    private BigDecimal imc;
}